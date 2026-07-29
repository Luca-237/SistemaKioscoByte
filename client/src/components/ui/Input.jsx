// Campo de texto. La clase admin-field envuelve label + input; este componente
// expone solo el <input> para poder usarlo solo o con Label.
export function Input({ className = '', ...props }) {
    return (
        <input
            className={['admin-field-input', className].filter(Boolean).join(' ')}
            {...props}
        />
    );
}
