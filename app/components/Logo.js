export default function Logo({ size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#000',
        border: '2px solid #fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: '#fff',
          fontSize: size * 0.5,
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          letterSpacing: '-2px',
        }}
      >
        G
      </span>
    </div>
  )
}