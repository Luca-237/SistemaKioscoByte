const { AppError } = require('../middlewares/error');

// Catálogo de artículos del tenant. Las existencias viven en BranchStock
// (son por sucursal), por eso getAllArticles les hace un overlay opcional.

// ==========================================
// LECTURA
// ==========================================

/**
 * Lista los artículos activos. Si se pasa branchId, agrega existencias
 * (stock y costo promedio) de esa sucursal a cada artículo.
 * @param {Object} models Modelos del tenant.
 * @param {string} [branchId] Sucursal para la que se quiere ver el stock.
 * @returns {Promise<Array>} Artículos, con stock/avgCost si se pidió branchId.
 */
const getAllArticles = async (models, branchId) => {
    const articles = await models.Article.find({ active: true }).sort({ name: 1 }).lean();

    if (branchId) {
        const stocks = await models.BranchStock.find({ branchId }).lean();
        const porArticulo = new Map(stocks.map(s => [s.articleId.toString(), s]));
        for (const a of articles) {
            const s = porArticulo.get(a._id.toString());
            a.stock = s?.quantity ?? 0;
            a.avgCost = s?.avgCost ?? 0;
        }
    }
    return articles;
};

/**
 * Catálogo con existencias de una sucursal, para la grilla del punto de
 * venta del operario. A diferencia de getAllArticles, NUNCA expone el costo
 * promedio: el operario no debe ver el margen del negocio.
 * @param {Object} models Modelos del tenant.
 * @param {string} branchId Sucursal activa del operario.
 * @returns {Promise<Array>} Artículos activos con stock de esa sucursal.
 */
const getArticlesForBranch = async (models, branchId) => {
    const [articles, stocks] = await Promise.all([
        models.Article.find({ active: true }).sort({ name: 1 }).lean(),
        models.BranchStock.find({ branchId }).lean()
    ]);
    const porArticulo = new Map(stocks.map(s => [s.articleId.toString(), s.quantity]));
    for (const a of articles) a.stock = porArticulo.get(a._id.toString()) ?? 0;
    return articles;
};

// ==========================================
// CREACIÓN
// ==========================================

/**
 * Crea un artículo nuevo en el catálogo.
 * @param {Object} models Modelos del tenant.
 * @param {Object} data Datos del artículo: { code, barcode, name, description, category, unit, salePrice }.
 * @returns {Promise<Object>} Artículo creado.
 * @throws {Error} 400 si faltan datos obligatorios o el precio es inválido.
 */
const createArticle = async (models, { code, barcode, name, description, category, unit, salePrice, imageUrl, image_url, image }) => {
    if (!code || !name || salePrice === undefined) {
        throw new AppError(400, 'Faltan código, nombre o precio de venta');
    }
    if (!Number.isFinite(Number(salePrice)) || Number(salePrice) < 0) {
        throw new AppError(400, 'Precio de venta inválido');
    }

    const cleanBarcode = barcode && String(barcode).trim() ? String(barcode).trim() : undefined;
    const cleanCategory = category && String(category).trim() ? String(category).trim() : '';

    if (cleanCategory && models.Category) {
        await models.Category.updateOne(
            { name: cleanCategory },
            { $setOnInsert: { name: cleanCategory, requiereVencimiento: false } },
            { upsert: true }
        ).catch(() => {});
    }

    try {
        return await models.Article.create({
            code: String(code).trim(),
            barcode: cleanBarcode,
            name: name.trim(),
            description,
            category: cleanCategory,
            unit,
            salePrice: Number(salePrice),
            imageUrl: imageUrl || image_url || image
        });
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern?.code || error.message?.includes('code')) {
                throw new AppError(400, 'Ya existe un artículo con ese código');
            }
            if (error.keyPattern?.barcode || error.message?.includes('barcode')) {
                throw new AppError(400, 'Ya existe un artículo con ese código de barras');
            }
        }
        throw error;
    }
};

// ==========================================
// ACTUALIZACIÓN
// ==========================================

/**
 * Actualiza los datos de un artículo existente.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId del artículo.
 * @param {Object} data Datos a actualizar.
 * @returns {Promise<Object>} Artículo actualizado.
 * @throws {Error} 404 si no existe.
 */
const updateArticle = async (models, id, { code, barcode, name, description, category, unit, salePrice, imageUrl, image_url, image, active }) => {
    const cleanBarcode = barcode && String(barcode).trim() ? String(barcode).trim() : undefined;
    const cleanCategory = category && String(category).trim() ? String(category).trim() : '';

    if (cleanCategory && models.Category) {
        await models.Category.updateOne(
            { name: cleanCategory },
            { $setOnInsert: { name: cleanCategory, requiereVencimiento: false } },
            { upsert: true }
        ).catch(() => {});
    }

    try {
        const updateData = {
            code: code ? String(code).trim() : undefined,
            barcode: cleanBarcode,
            name: name ? String(name).trim() : undefined,
            description,
            category: cleanCategory,
            unit,
            salePrice: salePrice !== undefined ? Number(salePrice) : undefined,
            imageUrl: imageUrl || image_url || image,
            active
        };

        const updateDoc = cleanBarcode === undefined 
            ? { $set: updateData, $unset: { barcode: 1 } }
            : { $set: updateData };

        const article = await models.Article.findOneAndUpdate(
            { _id: id },
            updateDoc,
            { new: true, runValidators: true }
        );
        if (!article) throw new AppError(404, 'Artículo no encontrado');
        return article;
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern?.code || error.message?.includes('code')) {
                throw new AppError(400, 'Ya existe un artículo con ese código');
            }
            if (error.keyPattern?.barcode || error.message?.includes('barcode')) {
                throw new AppError(400, 'Ya existe un artículo con ese código de barras');
            }
        }
        throw error;
    }
};

// ==========================================
// BAJA
// ==========================================

/**
 * Da de baja lógica un artículo: sale del catálogo pero las ventas
 * históricas quedan intactas.
 * @param {Object} models Modelos del tenant.
 * @param {string} id ObjectId del artículo.
 * @throws {Error} 404 si no existe.
 */
const deactivateArticle = async (models, id) => {
    const article = await models.Article.findOneAndUpdate(
        { _id: id },
        { active: false },
        { new: true }
    );
    if (!article) throw new AppError(404, 'Artículo no encontrado');
};

module.exports = { getAllArticles, getArticlesForBranch, createArticle, updateArticle, deactivateArticle };
