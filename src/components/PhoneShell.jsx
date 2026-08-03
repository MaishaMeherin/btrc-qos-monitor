export default function PhoneShell({ children, nav, overlay, sheets }) {
  return (
    <div className="phone-shell relative grain">
      <div className="notch"></div>
      <div className="screen relative">{children}</div>
      {nav}
      {overlay}
      {sheets}
    </div>
  )
}