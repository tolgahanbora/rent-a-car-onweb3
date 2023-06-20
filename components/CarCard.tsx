"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Elusiv } from '@elusiv/sdk';

import { calculateCarRent, generateCarImageUrl } from "@utils";
import { CarProps } from "@types";
import CustomButton from "./CustomButton";
import CarDetails from "./CarDetails";
import { Connection, PublicKey } from "@solana/web3.js";
import { supabase } from "@utils/supabase";
import { LAMPORTS_PER_SOL, Transaction, Keypair } from '@solana/web3.js';

interface CarCardProps {
  car: CarProps;
}

const CarCard = ({ car }: CarCardProps) => {
  const { city_mpg, year, make, model, transmission, drive } = car;

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser]: any = useState()

  const carRent = calculateCarRent(city_mpg, year);

  const getUser = async () => {

    const { data: { user }, error } = await supabase.auth.getUser()

    if (!error) {
      setUser(user)
      console.log(user?.user_metadata.wallet)
    }

  }

  function getUserPubKey(): any {
    const publickKey = new PublicKey(user?.user_metadata.wallet)
    return publickKey;
  }

  // Create the elusiv instance
  const cluster = 'devnet';
  const connection = new Connection("https://api.devnet.solana.com", 'confirmed')
  const recipient = new PublicKey('3yviVNNhBJzqkWGVrhFEswiGJKmg3U7wwLJXp7iD9s21');



  async function performEluvioTransactions() {
    try {
      // Create the elusiv instance
      const cluster = 'devnet';
      const connection = new Connection("https://api.devnet.solana.com", 'confirmed')
      const seed = new Uint8Array([]);

     
      const elusiv = await Elusiv.getElusivInstance(seed, getUserPubKey(), connection, cluster);

      // Top up our private balance with 1 SOL
      const topupTxData = await elusiv.buildTopUpTx(LAMPORTS_PER_SOL, 'LAMPORTS');

      /* // Sign and send the top-up transaction
      topupTxData.tx = signTx(topupTxData.tx);
      const storeSig = await elusiv.sendElusivTx(topupTxData);

      // Send half a SOL, privately
      const sendTx = await elusiv.buildSendTx(0.5 * LAMPORTS_PER_SOL, recipient, 'LAMPORTS');
      const sendSig = await elusiv.sendElusivTx(sendTx);

      console.log('Ta-da!'); */
    } catch (error) {
      console.error('An error occurred:', error);
    } }




 useEffect(() => {
  getUser()
 }, [])

  return (
    <div className="car-card group">
      <div className="car-card__content">
        <h2 className="car-card__content-title">
          {make} {model}
        </h2>
      </div>

      <p className='flex mt-6 text-[32px] leading-[38px] font-extrabold'>
        <span className='self-start text-[14px] leading-[17px] font-semibold'>$</span>
        {carRent}
        <span className='self-end text-[14px] leading-[17px] font-medium'>/day</span>
      </p>

      <div className='relative w-full h-40 my-3 object-contain'>
        <Image src={generateCarImageUrl(car)} alt='car model' fill priority className='object-contain' />
      </div>

      <div className='relative flex w-full mt-2'>
        <div className='flex group-hover:invisible w-full justify-between text-grey'>
          <div className='flex flex-col justify-center items-center gap-2'>
            <Image src='/steering-wheel.svg' width={20} height={20} alt='steering wheel' />
            <p className='text-[14px] leading-[17px]'>
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
            title='View More'
            containerStyles='w-full py-[16px] rounded-full bg-primary-blue'
            textStyles='text-white text-[14px] leading-[17px] font-bold'
            rightIcon='/right-arrow.svg'
            handleClick={() => setIsOpen(true)}
          />
               <CustomButton
            title='View More'
            containerStyles='w-full py-[16px] rounded-full bg-primary-blue'
            textStyles='text-white text-[14px] leading-[17px] font-bold'
            rightIcon='/right-arrow.svg'
            handleClick={ performEluvioTransactions}
          />
        </div>
      </div>

      <CarDetails isOpen={isOpen} closeModal={() => setIsOpen(false)} car={car} />
    </div>
  );
};

export default CarCard;


