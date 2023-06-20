import { useState } from "react";
import { supabase } from "@utils/supabase";



declare global {
    interface Window {
      solana: any;
    }
  }

const ConnectWalletButton = ({ setWalletAddress }: any) => {
    
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        await window.solana.connect();
        setIsConnected(true);

        // Cüzdan bağlandıktan sonra yapılacak işlemleri burada gerçekleştirebilirsiniz
        const { publicKey } = window.solana;
        if (publicKey) {
          setWalletAddress(publicKey.toBase58());
          const { data, error } = await supabase.auth.updateUser({
            data: { wallet: publicKey.toBase58() }
          })
        }
  
      } catch (error) {
        
        console.error("Phantom cüzdanına bağlanırken bir hata oluştu:", error);
      }
    } else {
      console.error("Phantom cüzdanı yüklü değil veya tarayıcınız tarafından desteklenmiyor.");
    }
  };

  return (
    <button
      type='button'
      className='px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none rounded-3xl'
      onClick={connectWallet}
      disabled={isConnected}
    >
      {isConnected ? "Connected" : "Connect Wallet"}
    </button>
  );
};

export default ConnectWalletButton;
