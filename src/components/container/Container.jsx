const WIDTHS = {
    default: 'max-w-6xl',
    narrow: 'max-w-3xl',
    wide: 'max-w-7xl',
}

export default function Container({ children, width = 'default', className = '' }) {
    return <div className={`mx-auto w-full ${WIDTHS[width] || WIDTHS.default} px-4 sm:px-6 ${className}`}>{children}</div>
}
