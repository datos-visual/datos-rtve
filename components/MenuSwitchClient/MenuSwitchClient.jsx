"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HamburgerMenu from "../HamburgerMenu/HamburgerMenu";
import MenuSwitch from "../common/MenuSwitch";

export default function MenuSwitchClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleMenuNavigation = (page) => {
    if (page === "historias") {
      router.push("/historias");
    } else if (page === "fosas") {
      router.push("/mapa");
    }
  };

  return (
    <>
      <MenuSwitch
        style={{ zIndex: 999 }}
        onOpenMenu={() => setMenuOpen(true)}
        onNavigate={handleMenuNavigation}
      />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
