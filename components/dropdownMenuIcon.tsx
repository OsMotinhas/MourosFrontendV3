"use client";

import {
  Container,
  DotsVertical,
  HelpCircle,
  LayersTwo01,
  LogOut01,
  Settings01,
  User01,
} from "@untitledui/icons";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DropdownMemberItem {
  name: string;
  username: string;
  status: string;
  email: string;
  tipo: {
    name: string;
    color: string;
  }[];
  avatarUrl: string;
  numeroSocio: string;
  gender: string;
}

interface DropdownIconProps {
  item: DropdownMemberItem;
  onDelete?: (memberName: string) => void;
}

export const DropdownIcon = ({ item, onDelete }: DropdownIconProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <ButtonUtility
        size="xs"
        color="tertiary"
        tooltip="Mais ações"
        icon={DotsVertical}
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-64 p-0">
      <div className="flex gap-3 border-b border-border p-3">
        <AvatarLabelGroup
          size="md"
          src={item.avatarUrl}
          title={item.name}
          subtitle={`${"#" + item.numeroSocio} - ${item.status}`}
        />
      </div>
      <div className="p-1">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User01 />
            <span>Ver perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings01 />
            <span>Definições</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <LayersTwo01 />
            <span>Estado: {item.status}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle />
            <span>N.º Sócio: {item.numeroSocio}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Container />
            <span>Tipo: {item.tipo.map((team) => team.name).join(", ")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete?.(item.name)}
          >
            <LogOut01 />
            <span>Remover</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);
