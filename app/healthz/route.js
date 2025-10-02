/**
 * Health Check Endpoint
 * Este endpoint es necesario para que el contenedor no se reinicie constantemente
 * Devuelve 200 OK si la aplicación está funcionando correctamente
 */

export async function GET() {
  return new Response(
    JSON.stringify({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'rtve-fosas'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

