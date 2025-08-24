import Link from "next/link";
import { ConnectButton } from "@/components/connect.button";
import { GiftIcon, Heart } from "lucide-react";
import Image from "next/image";
import BalanceWidget from "@/components/balance.widget";
import { RankButton } from "@/app/leaderboard/rank.button";
import { Button } from "@/components/retroui/Button";
import { GiGreekTemple } from "react-icons/gi";

export default function Header({
  title = "战场",
  description = "为了部落，努力打卡！",
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
          <RankButton />

          <Link href="/shrine">
            <Button variant="outline" className="gap-2">
              <GiGreekTemple className="w-4 h-4" />
              商店
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
