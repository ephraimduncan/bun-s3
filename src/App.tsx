import { Card, CardContent } from "@/components/ui/card";
import "../styles/index.css";

import logo from "../public/assets/logo.svg";
import reactLogo from "../public/assets/react.svg";

export function App() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]"
        />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-muted">
        <CardContent className="pt-6">
          <h1 className="text-5xl font-bold my-4 leading-tight">Bun + S3</h1>

          {/* <APITester /> */}

          {/* <FileUploader /> */}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
