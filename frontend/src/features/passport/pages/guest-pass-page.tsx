import type { Icon } from "@tabler/icons-react";
import {
  IconArrowLeft,
  IconCake,
  IconCoin,
  IconId,
  IconShieldLock,
  IconStarFilled,
  IconWheelchair,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

import passWindow from "../../../../assets/pass.svg";
import oceanBg from "@/assets/ocean-bg.svg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTokenWalletStore } from "@/features/tokens/token-store";
import { getInitials } from "@/lib/guest";
import { cn } from "@/lib/utils";
import { useSession } from "@/stores/session-selectors";

interface PassDetailProps {
  icon: Icon;
  label: string;
  value: string;
  className?: string;
}

function PassDetail({
  icon: DetailIcon,
  label,
  value,
  className,
}: PassDetailProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-[#142f24]/15 bg-[#f5f4eb]/90 p-4 shadow-sm",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-[#2d5f4c]/75 uppercase">
        <DetailIcon size={13} />
        {label}
      </span>
      <p className="mt-2 font-display text-xl leading-tight font-semibold text-[#142f24]">
        {value}
      </p>
    </div>
  );
}

export function GuestPassPage() {
  const session = useSession();
  const navigate = useNavigate();
  const tokenBalance = useTokenWalletStore((state) =>
    session?.role === "guest" ? (state.balances[session.guest.id] ?? 0) : 0
  );

  if (!session) return null;

  const isGuest = session.role === "guest";
  const displayName = isGuest
    ? `${session.guest.name} ${session.guest.surname}`
    : session.displayName;

  return (
    <main className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#123228] text-[#142f24]">
      <img
        src={oceanBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
      />
      <div className="fixed inset-0 bg-[#123228]/55" />
      <img
        src={passWindow}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-center opacity-95"
      />

      <div className="relative z-10 flex min-h-svh flex-col p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/map")}
            className="border border-[#142f24]/15 bg-[#f5f4eb]/90 text-[#142f24] shadow-sm hover:bg-white"
          >
            <IconArrowLeft size={16} />
            Map
          </Button>
          <Badge className="rounded-full border border-[#142f24]/15 bg-[#48b07d] px-4 py-1.5 text-xs font-semibold tracking-widest text-white uppercase shadow-sm">
            Guest Passport
          </Badge>
        </header>

        <section className="grid flex-1 grid-cols-1 content-center gap-4 py-5 lg:grid-cols-[minmax(270px,0.8fr)_minmax(430px,1.2fr)] lg:items-center lg:gap-6">
          <aside className="flex flex-col justify-between rounded-[8px] border border-[#142f24]/15 bg-[#f1f1ec]/95 p-5 shadow-xl backdrop-blur-sm sm:p-6 lg:h-[72svh] lg:min-h-[520px] lg:max-h-[680px]">
            <div>
              <div className="flex items-center gap-4">
                {isGuest ? (
                  <Avatar className="size-20 border-4 border-[#48b07d] bg-[#48b07d] text-2xl font-bold text-white shadow-md">
                    <AvatarFallback className="bg-[#48b07d] text-white">
                      {getInitials(session.guest)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full border-4 border-[#48b07d] bg-[#143326] text-white shadow-md">
                    <IconShieldLock size={32} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-widest text-[#2d5f4c]/70 uppercase">
                    Active session
                  </p>
                  <h1 className="mt-1 break-words font-display text-3xl leading-none font-semibold text-[#142f24] sm:text-4xl lg:text-5xl">
                    {displayName}
                  </h1>
                </div>
              </div>

              <p className="mt-6 text-base leading-7 font-medium text-[#355b4d]">
                {isGuest
                  ? session.guest.personality
                  : "Observer access for resort operations and live island activity."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[8px] bg-[#142f24] p-4 text-white shadow-sm">
                <span className="text-[11px] font-semibold tracking-widest text-white/60 uppercase">
                  Tokens
                </span>
                <p className="mt-2 flex items-center gap-2 font-display text-4xl font-semibold">
                  <IconCoin size={26} />
                  {tokenBalance}
                </p>
              </div>
              <div className="rounded-[8px] bg-[#e2eae2] p-4 shadow-sm">
                <span className="text-[11px] font-semibold tracking-widest text-[#2d5f4c]/70 uppercase">
                  Status
                </span>
                <p className="mt-2 font-display text-3xl font-semibold text-[#142f24]">
                  {isGuest ? "Ready" : "Admin"}
                </p>
              </div>
            </div>
          </aside>

          <div className="grid gap-4 rounded-[8px] border border-[#142f24]/15 bg-[#f1f1ec]/95 p-5 shadow-xl backdrop-blur-sm sm:p-6 lg:h-[72svh] lg:min-h-[520px] lg:max-h-[680px] lg:grid-cols-2 lg:content-between">
            {isGuest ? (
              <>
                <PassDetail
                  icon={IconId}
                  label="Passport"
                  value={session.guest.passport}
                />
                <PassDetail
                  icon={IconCake}
                  label="Age"
                  value={String(session.guest.age)}
                />
                <PassDetail
                  icon={IconStarFilled}
                  label="Priority"
                  value={
                    session.guest.priority === "fast"
                      ? "Fast pass"
                      : "Standard"
                  }
                />
                <PassDetail
                  icon={IconWheelchair}
                  label="Access"
                  value={
                    session.guest.disability ? "Accessible" : "Standard route"
                  }
                />
                <PassDetail
                  icon={IconId}
                  label="Guest ID"
                  value={session.guest.id}
                  className="lg:col-span-2"
                />
                <div className="rounded-[8px] border border-dashed border-[#48b07d]/45 bg-[#48b07d]/10 p-4 lg:col-span-2">
                  <p className="text-sm leading-6 font-medium text-[#245140]">
                    This pass follows {session.guest.name} across the island:
                    airport control, hotel booking, beach activities, and the
                    resort-wide event stream.
                  </p>
                </div>
              </>
            ) : (
              <>
                <PassDetail
                  icon={IconShieldLock}
                  label="Mode"
                  value="Observer"
                />
                <PassDetail
                  icon={IconId}
                  label="Access"
                  value="All zones"
                />
                <div className="rounded-[8px] border border-dashed border-[#48b07d]/45 bg-[#48b07d]/10 p-4 lg:col-span-2">
                  <p className="text-sm leading-6 font-medium text-[#245140]">
                    Admin sessions can inspect resort activity without changing
                    the current guest flow.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
