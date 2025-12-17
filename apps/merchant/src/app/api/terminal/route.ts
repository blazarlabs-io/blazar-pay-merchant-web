// Dynamic import to avoid bundling issues
let BeaconScanner: any = null;

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Only POST requests allowed" }),
      { status: 405 },
    );
  }

  const data = await req.json();
  const { service } = data;

  if (!service) {
    return new Response(JSON.stringify({ message: "Token not found" }), {
      status: 405,
    });
  }

  try {
    // Only import on server-side when needed
    if (!BeaconScanner) {
      BeaconScanner = await import("node-beacon-scanner");
    }

    console.log("HELLO WORLD Scanning...");

    const scanner = new BeaconScanner.default();

    scanner
      .startScan()
      .then((result: any) => {
        console.log("Scanning for BLE devices...", result);
      })
      .catch((error: any) => {
        console.error(error);
      });

    setTimeout(() => {
      console.log("Scan stopped");
    }, 10000);

    const response = {
      data: {
        success: true,
      },
    };

    if (response.data.success) {
      return new Response(JSON.stringify({ message: "Success" }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ message: "Failed to verify" }), {
        status: 405,
      });
    }
  } catch (error) {
    console.error("Bluetooth scanning error:", error);
    return new Response(
      JSON.stringify({
        message: "Bluetooth scanning not available on this platform",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
      },
    );
  }
}
