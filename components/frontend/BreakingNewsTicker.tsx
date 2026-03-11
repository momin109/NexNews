export function BreakingNewsTicker() {
  return (
    <div className="bg-background border-b px-4">
      <div className="container mx-auto flex items-center h-10 overflow-hidden">
        <div className="bg-destructive text-destructive-foreground text-[10px] font-black uppercase px-3 h-full flex items-center tracking-tighter skew-x-[-12deg] mr-4 whitespace-nowrap">
          Breaking News
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm font-semibold text-foreground/80">
            • Global markets reach all-time high amid economic recovery optimism
            • New environmental protection laws passed by city council today •
            Sports: Local team signs star player for record-breaking fee •
          </div>
        </div>
      </div>
    </div>
  );
}
