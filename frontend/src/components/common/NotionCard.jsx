const NotionCard = ({ children, className = "" }) => {
  return (
    <div className={`notion-card ${className}`}>
      {children}
    </div>
  )
}

export default NotionCard