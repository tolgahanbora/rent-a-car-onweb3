"use client";
import Link from "next/link";
import Image from "next/image";
import Modal from "react-modal";
import CustomButton from "./CustomButton";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { supabase } from "@utils/supabase";
import "react-toastify/dist/ReactToastify.css";
import Avatar from "react-avatar";
import ConnectWalletButton from "./Phantom";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const NavBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setisLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [wallet, setWallet] = useState(walletAddress);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser]: any = useState();

  const { disconnect }: any = useWallet();

  // Modal açma ve kapama işlemlerini gerçekleştiren fonksiyonlar
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Modal açma ve kapama işlemlerini gerçekleştiren fonksiyonlar
  const openLoginModal = () => {
    setisLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setisLoginModalOpen(false);
  };

  // Modal açma ve kapama işlemlerini gerçekleştiren fonksiyonlar
  const openProfileModal = () => {
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          wallet: walletAddress,
        },
      },
    });

    if (error) {
      // Kayıt sırasında bir hata oluştuysa
      toast.error("The registration process failed.");
    } else {
      // Kayıt başarılı olduğunda
      toast.success("Successfully created your account.");
    }
    // Form submit işlemleri
    console.log("Email:", email);
    console.log("Password:", password);

    // Formu sıfırla
    setEmail("");
    setPassword("");

    // Modalı kapat
    closeModal();
  };

  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();

    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Kayıt sırasında bir hata oluştuysa
      toast.error("Failed to log in");
    } else {
      // Kayıt başarılı olduğunda
      toast.success("You have successfully logged in.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    // Form submit işlemleri
    console.log("Email:", email);
    console.log("Password:", password);

    // Formu sıfırla
    setEmail("");
    setPassword("");

    // Modalı kapat
    closeModal();
  };

  //Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser("");
    disconnect();
    toast.success("Logout successful.");
  };

  const copyWallet = () => {
    // Logic to copy the wallet address to the clipboard
    // You can use the Clipboard API or a library like `clipboard.js`

    // Example using the Clipboard API
    console.log(wallet);
    console.log(walletAddress);
    navigator.clipboard
      .writeText(wallet)
      .then(() => {
        toast.success("Wallet address copied to clipboard.");
      })
      .catch((error) => {
        toast.error("Failed to copy wallet address to clipboard.");
      });
  };

  return (
    <header className="w-full  absolute z-10">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center sm:px-16 px-6 py-4 bg-transparent">
        <Link href="/" className="flex justify-center items-center">
          <Image
            src="/logo.svg"
            alt="logo"
            width={118}
            height={18}
            className="object-contain"
          />
        </Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              {/* Profile Modal  */}
              <Modal
                isOpen={isProfileModalOpen}
                onRequestClose={closeProfileModal}
                className="w-[400px] h-[300px] rounded-lg"
                overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
              >
                {/* Modal içeriği */}
                <div className="p-4 bg-white rounded-xl">
                  <h1 className="text-2xl font-bold mb-4">Profile</h1>
                  <div className="flex items-center mb-4">
                    <span className="text-gray-700 font-medium">
                      {user.email}
                    </span>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="wallet"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Solana Wallet
                      </label>
                      <input
                        type="text"
                        id="wallet"
                        disabled
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                        value={walletAddress}
                        onChange={(e) => setWallet(e.target.value)}
                      />
                    </div>
                    <div className="text-center">
                      <ConnectWalletButton
                        walletAddress={walletAddress}
                        setWalletAddress={setWalletAddress}
                      />
                      <button
                        type="button"
                        className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none rounded-3xl ml-4"
                        onClick={copyWallet}
                      >
                        Copy Wallet
                      </button>
                    </div>
                  </form>
                </div>
                <button onClick={closeLoginModal}>Kapat</button>
              </Modal>

              <div className="flex items-center space-x-2">
                <WalletMultiButton />
                <WalletDisconnectButton />

                <CustomButton
                  title="Profile"
                  btnType="button"
                  containerStyles="text-primary-blue rounded-full bg-white min-w-[130px]"
                  handleClick={openProfileModal}
                />
                {/* Render user avatar here */}
              </div>
              <CustomButton
                title="Logout"
                btnType="button"
                containerStyles="text-primary-blue rounded-full bg-white min-w-[130px]"
                handleClick={handleLogout}
              />
            </>
          ) : (
            <>
              <CustomButton
                title="Login"
                btnType="button"
                containerStyles="text-primary-blue rounded-full bg-white min-w-[130px]c"
                handleClick={openLoginModal}
              />

              <CustomButton
                title="Sign up"
                btnType="button"
                containerStyles="text-primary-blue rounded-full bg-white min-w-[130px]"
                handleClick={openModal}
              />
            </>
          )}
          {/* Sign Up Modal  */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="w-[400px] h-[300px] rounded-lg"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
          >
            {/* Modal içeriği */}
            <div className="p-4 bg-white rounded-xl">
              <h1 className="text-2xl font-bold mb-4">Sign In</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none rounded-3xl"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
            <button onClick={closeModal}>Kapat</button>
          </Modal>

          {/* Login Modal  */}
          <Modal
            isOpen={isLoginModalOpen}
            onRequestClose={closeLoginModal}
            className="w-[400px] h-[300px] rounded-lg"
            overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
          >
            {/* Modal içeriği */}
            <div className="p-4 bg-white rounded-xl">
              <h1 className="text-2xl font-bold mb-4">Login</h1>
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none rounded-3xl"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
            <button onClick={closeLoginModal}>Kapat</button>
          </Modal>
        </div>
      </nav>
      <ToastContainer />
    </header>
  );
};
export default NavBar;
