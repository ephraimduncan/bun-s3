import { Card, CardContent } from "@/components/ui/card";
import "../styles/index.css";

import logo from "../public/assets/logo.svg";
import reactLogo from "../public/assets/react.svg";
import { FileUpload } from "./components/file-uploader";

export function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen mx-auto p-8  relative z-10">
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

      <Card className="bg-card/50 w-full max-w-lg backdrop-blur-sm border-muted">
        <CardContent className="pt-4">
          <h1 className="text-5xl font-bold my-4 leading-tight text-center">
            Bun + S3
          </h1>

          <FileUpload />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
