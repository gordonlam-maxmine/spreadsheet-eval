export default function AgGridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ag-grid-container" style={{ padding: '20px', height: '100vh' }}>
      {children}
    </div>
  );
} 