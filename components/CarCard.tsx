"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Elusiv } from "@elusiv/sdk";

import { calculateCarRent, generateCarImageUrl } from "@utils";
import { CarProps } from "@types";
import CustomButton from "./CustomButton";
import CarDetails from "./CarDetails";
import { Connection, PublicKey } from "@solana/web3.js";
import { supabase } from "@utils/supabase";
import { LAMPORTS_PER_SOL, Transaction, Keypair } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface CarCardProps {
  car: CarProps;
}

const CarCard = ({ car }: CarCardProps) => {
  const { city_mpg, year, make, model, transmission, drive } = car;

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser]: any = useState();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction }: any = useWallet();

  const carRent = calculateCarRent(city_mpg, year);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (!error) {
      setUser(data);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  async function performEluvioTransactions() {
    try {
      // Checking the wallet connection
      if (publicKey) {
        // getting seed for elusiv
        const seed = publicKey.toBytes();

        // Create the elusiv instance
        const cluster = "devnet";
        const connection = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );

        const elusiv = await Elusiv.getElusivInstance(
          seed,
          publicKey,
          connection,
          cluster
        );

        // define the recipient
        const recipient = new PublicKey(
          "98tuTXembYwBCJJModyyGHBXwhWcaLdFv582bpNN1eV1"
        );

        // Top up our private balance with 0.01 SOL
        let topupTxData = await elusiv.buildTopUpTx(
          0.01 * LAMPORTS_PER_SOL,
          "LAMPORTS"
        );

        // sign the transaction
        topupTxData.tx = await signTransaction(topupTxData.tx);

        // send the top-up transaction

        const storeSig = await elusiv.sendElusivTx(topupTxData);

        // Send 0.01 SOL, privately

        const sendTx = await elusiv.buildSendTx(
          0.01 * LAMPORTS_PER_SOL,
          recipient,
          "LAMPORTS"
        );

        const sendSig = await elusiv.sendElusivTx(sendTx);

        toast.success("The payment is successful !");
        console.log("Ta-da!");
      } else {
        toast.warning("Please Connect a wallet");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  return (
    <div className="car-card group">
      <div className="car-card__content">
        <h2 className="car-card__content-title">
          {make} {model}
        </h2>
      </div>

      <p className="flex mt-6 text-[32px] leading-[38px] font-extrabold">
        <span className="self-start text-[14px] leading-[17px] font-semibold">
          $
        </span>
        {carRent}
        <span className="self-end text-[14px] leading-[17px] font-medium">
          /day
        </span>
      </p>

      <div className="relative w-full h-40 my-3 object-contain">
        <Image
          src={generateCarImageUrl(car)}
          alt="car model"
          fill
          priority
          className="object-contain"
        />
      </div>

      <div className="relative flex w-full mt-2">
        <div className="flex group-hover:invisible w-full justify-between text-grey">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              src="/steering-wheel.svg"
              width={20}
              height={20}
              alt="steering wheel"
            />
            <p className="text-[14px] leading-[17px]">
              {transmission === "a" ? "Automatic" : "Manual"}
            </p>
          </div>
          <div className="car-card__icon">
            <Image src="/tire.svg" width={20} height={20} alt="seat" />
            <p className="car-card__icon-text">{drive.toUpperCase()}</p>
          </div>
          <div className="car-card__icon">
            <Image src="/gas.svg" width={20} height={20} alt="seat" />
            <p className="car-card__icon-text">{city_mpg} MPG</p>
          </div>
        </div>

        <div className="car-card__btn-container">
          <CustomButton
            title="View More"
            containerStyles="w-full py-[16px] rounded-full bg-primary-blue"
            textStyles="text-white text-[14px] leading-[17px] font-bold"
            rightIcon="/right-arrow.svg"
            handleClick={() => setIsOpen(true)}
          />
          <CustomButton
            title="Rent the Car"
            containerStyles="w-full py-[16px] rounded-full bg-primary-blue"
            textStyles="text-white text-[14px] leading-[17px] font-bold"
            rightIcon="/right-arrow.svg"
            handleClick={() => {
              if (user) {
                performEluvioTransactions();
              } else {
                alert("Please log in first!");
              }
            }}
          />
        </div>
      </div>

      <CarDetails
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        car={car}
      />
      <ToastContainer />
    </div>
  );
};

export default CarCard;
