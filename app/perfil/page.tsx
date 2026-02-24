import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { AvatarProfilePhoto } from "@/components/base/avatar/avatar-profile-photo";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

const profileStats = [
  { label: "Tempo", value: "4 anos" },
  { label: "Motos", value: "3" },
  { label: "Eventos", value: "12" },
  { label: "Seguidores", value: "32.086" },
]

export default function Table1() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="min-h-screen flex-1 rounded-xl bg-muted/40 md:min-h-min">
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <div className="relative">
                    <div className="h-36 w-full bg-linear-to-tr from-sky-200 via-cyan-100 to-blue-300 sm:h-44 lg:h-56 dark:from-sky-900 dark:via-cyan-950 dark:to-blue-900" />
                    <div className="absolute top-full left-4 z-10 -translate-y-1/2 sm:left-6 lg:left-8">
                      <AvatarProfilePhoto
                        verified
                        size="lg"
                        alt="João Barbosa"
                        src="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"
                      />
                    </div>
                  </div>

                  <div className="px-4 pt-24 pb-6 sm:px-6 sm:pt-28 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                          João Barbosa
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                          joao@email.com
                        </p>
                      </div>

                      <div className="w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:gap-x-8">
                          {profileStats.map((item) => (
                            <div
                              key={item.label}
                              className="min-w-24 lg:border-l lg:border-border lg:pl-6 lg:text-right first:lg:border-l-0 first:lg:pl-0"
                            >
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {item.label}
                              </p>
                              <p className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
