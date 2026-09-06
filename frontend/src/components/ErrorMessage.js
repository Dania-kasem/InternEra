function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#ffe0e0',
      color: '#cc0000',
      padding: '10px 15px',
      borderRadius: '6px',
      marginBottom: '15px',
      border: '1px solid #cc0000'
    }}>
      ⚠️ {message}
    </div>
  );
}

export default ErrorMessage;
