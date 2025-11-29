import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export const MiniPayButton = () => {
  const connectMiniPay = async () => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected MiniPay account:", accounts[0]);
        alert(`Connected: ${accounts[0]}`);
      } catch (error) {
        console.error("Error connecting to MiniPay", error);
      }
    } else {
      alert("MiniPay not detected. Please open this app in the Opera Mini browser.");
    }
  };

  return (
    <Button 
      onClick={connectMiniPay}
      className="bg-[#35D07F] hover:bg-[#2fb870] text-white font-bold py-2 px-4 rounded-full flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      Connect MiniPay
    </Button>
  );
};

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
