import Link from "next/link";
import { ConnectButton } from "@/components/connect.button";
import { GiftIcon, Heart } from "lucide-react";
import Image from "next/image";
import BalanceWidget from "@/components/balance.widget";
import { CreateButton } from "@/components/create.button";
import { RankButton } from "@/app/leaderboard/rank.button";
import { Button } from "@/components/retroui/Button";
import { GiWarAxe, GiWarBonnet } from "react-icons/gi";

export default function ShrineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 gap-2">
      {/* Header */}
      <Header />
      {children}
    </div>
  );
}

export function Header({
  title = "商店",
  description = "使用 WEDO 代币购买强化道具，提升团队实力",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/pixel-archer.png"
                alt="logo"
                width={60}
                height={60}
              />
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">{title}</h1>
            </Link>
            <Button variant="outline" size="icon" className="rounded-full">
              <Link href="/leaderboard/kiosk">
                <Heart className="w-4 h-4 fill-red-500 stroke-0" />
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground ">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          <BalanceWidget />

          <Link href="/leaderboard">
            <Button variant="outline" className="gap-2">
              <GiWarAxe className="w-4 h-4" />
              战场
            </Button>
          </Link>
          <Link href="/pool">
            <Button variant="outline" className="gap-2">
              <GiftIcon className="w-4 h-4" />
              奖池
            </Button>
          </Link>

          <div className="rounded-lg">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
