import { motion } from "framer-motion";
import Image from "next/image";

export default function ReceivePaymentAnim() {
  return (
    <div className="relative flex flex-col items-center justify-center min-w-[140px] min-h-[140px]">
      <Image
        src="/images/receive-payment-anim/terminal.png"
        alt="Receive Payment"
        width={212}
        height={48}
        className="absolute"
      />
      <motion.div
        animate={{ x: [0, 148, 0] }} // Animate opacity from 0 to 1 and back to 0
        transition={{
          duration: 3, // Each cycle takes 2 seconds
          repeat: Infinity, // Repeat indefinitely
          repeatType: "loop", // Loop by restarting
          ease: "easeInOut", // Smooth easing
        }}
        style={{ width: 100, height: 100, opacity: 1 }}
      >
        <Image
          src="/images/receive-payment-anim/phone.png"
          alt="Receive Payment"
          width={80}
          height={40}
          className=""
        />
      </motion.div>
    </div>
  );
}
