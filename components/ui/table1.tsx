"use client";

import { useMemo, useState } from "react";
import {
  Check,
  UserX01,
  ClockSnooze,
  Mail01
} from "@untitledui/icons";
import type { SortDescriptor } from "react-aria-components";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import teamMembers from "@/components/application/table/team-members.json";
import {AvatarLabelGroup} from "@/components/base/avatar/avatar-label-group";
import type { BadgeTypes } from "@/components/base/badges/badge-types";
import { Badge, type BadgeColor, BadgeWithIcon } from "@/components/base/badges/badges";
import {Tooltip, TooltipTrigger} from "@/components/base/tooltip/tooltip";
import { AlertDialogDestructive } from "@/components/modals/deleteModal";
import { DropdownIcon } from "@/components/dropdownMenuIcon";

const normalizeSearchText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSearchText(entry)).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((entry) => normalizeSearchText(entry))
      .join(" ");
  }

  return String(value);
};

const formatForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const Table01DividerLineSm = () => {
    const PAGE_SIZE = 30;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
      column: "numeroSocio",
      direction: "ascending",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

    const filteredItems = useMemo(() => {
      const normalizedQuery = formatForSearch(searchQuery);

      if (!normalizedQuery) {
        return teamMembers.items;
      }

      return teamMembers.items.filter((item) => {
        const searchableText = formatForSearch(normalizeSearchText(item));
        return searchableText.includes(normalizedQuery);
      });
    }, [searchQuery]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];

            // Compare numbers or booleans
            if ((typeof first === "number" && typeof second === "number") || (typeof first === "boolean" && typeof second === "boolean")) {
                return sortDescriptor.direction === "descending" ? second - first : first - second;
            }

            // Compare strings
            if (typeof first === "string" && typeof second === "string") {
                let cmp = first.localeCompare(second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }

            return 0;
        });
    }, [filteredItems, sortDescriptor]);
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginatedItems = useMemo(() => {
      const start = (currentPage - 1) * PAGE_SIZE;
      return sortedItems.slice(start, start + PAGE_SIZE);
    }, [currentPage, sortedItems]);

    const handlePageChange = (nextPage: number) => {
      const safePage = Math.min(totalPages, Math.max(1, nextPage));
      setPage(safePage);
    };

    const handleSortChange = (nextSort: SortDescriptor) => {
      setSortDescriptor(nextSort);
      setPage(1);
    };

    const handleSearchChange = (nextQuery: string) => {
      setSearchQuery(nextQuery);
      setPage(1);
    };

    const handleOpenDeleteDialog = (memberName: string) => {
      setMemberToDelete(memberName);
      setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
      if (memberToDelete) {
        alert(`Delete ${memberToDelete}`);
      }
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    };

    return (
      <TableCard.Root size="sm">
        <TableCard.Header
          title="Lista de sócios"
          badge={`${sortedItems.length}`}
          contentTrailing={
            <div className="absolute top-5 right-4 md:right-6">
              <TableRowActionsDropdown
                query={searchQuery}
                placeholder="Pesquisar membros..."
                onQueryChange={handleSearchChange}
              />
            </div>
          }
        />
        <Table
          aria-label="Team members"
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
        >
          <Table.Header>
            <Table.Head
              id="numeroSocio"
              label="Nº Sócio"
              allowsSorting
              className="whitespace-nowrap"
            />
            <Table.Head
              id="name"
              label="Nome"
              isRowHeader
              allowsSorting
              className="w-full max-w-1/4"
            />
            <Table.Head id="status" label="Status" allowsSorting />
            <Table.Head
              id="telemovel"
              label="Nº Telemóvel"
              className="md:hidden xl:table-cell"
            />
            <Table.Head id="joiaPaga" label="Jóia" allowsSorting />
            <Table.Head id="quota2025Paga" label="Quota 2025" allowsSorting />
            <Table.Head id="quota2026Paga" label="Quota 2026" allowsSorting />
            <Table.Head id="adicionadoWhatsApp" label="WhatsApp" allowsSorting />
            <Table.Head id="kitEntregue" label="Kit" allowsSorting />
            <Table.Head id="tipo" label="Tipo" />
            <Table.Head id="actions" />
          </Table.Header>

          <Table.Body items={paginatedItems}>
            {(item) => (
              <Table.Row id={item.username}>
                <Table.Cell className="whitespace-nowrap">
                  {item.numeroSocio}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <AvatarLabelGroup
                      size="md"
                      src={item.avatarUrl}
                      alt={item.name}
                      title={item.name}
                      subtitle={item.tipo.map((team) => team.name).join(", ")}
                    />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {item.status === "Regularizado" ? (
                    <Tooltip
                      title="Estado Regularizado"
                      description="O membro está regularizado se a jóia e a quota estiverem em dia."
                    >
                      <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                        <BadgeWithIcon
                          size="sm"
                          color="success"
                          iconLeading={Check}
                          className="capitalize"
                        >
                          {item.status}
                        </BadgeWithIcon>
                      </TooltipTrigger>
                    </Tooltip>
                  ) : item.status === "Expulso" ? (
                    <Tooltip
                      title="Estado Expulso"
                      description="O membro encontra-se expulso por incumprimento prolongado das quotas (mais de 2 anos), violação grave ou repetida dos estatutos, conduta desrespeitosa não corrigida no prazo definido, ou prática de atos ilegais ou prejudiciais à reputação da associação."
                    >
                      <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                        <BadgeWithIcon
                          size="sm"
                          color="gray"
                          iconLeading={UserX01}
                          className="capitalize"
                        >
                          {item.status}
                        </BadgeWithIcon>
                      </TooltipTrigger>
                    </Tooltip>
                  ) : item.status === "Atraso" ? (
                    <Tooltip
                      title="Estado de Atraso"
                      description="O membro encontra-se em atraso com as quotas."
                    >
                      <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                        <BadgeWithIcon
                          size="sm"
                          color="warning"
                          iconLeading={ClockSnooze}
                          className="capitalize"
                        >
                          {item.status}
                        </BadgeWithIcon>
                      </TooltipTrigger>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      title="Estado de Notificado"
                      description="O membro foi notificado sobre o atraso no pagamento das quotas e tem um prazo para regularizar a situação antes de ser expulso."
                    >
                      <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                        <BadgeWithIcon
                          size="sm"
                          color="error"
                          iconLeading={Mail01}
                          className="capitalize"
                        >
                          {item.status}
                        </BadgeWithIcon>
                      </TooltipTrigger>
                    </Tooltip>
                  )}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap md:hidden xl:table-cell">
                  {item.telemovel}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {String(item.joiaPaga)}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {String(item.quota2025Paga)}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {String(item.quota2026Paga)}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {String(item.adicionadoWhatsApp)}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {String(item.kitEntregue)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {item.tipo.slice(0, 3).map((team) => (
                      <Badge
                        key={team.name}
                        color={team.color as BadgeColor<BadgeTypes>}
                        size="sm"
                      >
                        {team.name}
                      </Badge>
                    ))}

                    {item.tipo.length > 3 && (
                      <Badge color="gray" size="sm">
                        +{item.tipo.length - 3}
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-3">
                  <div className="flex justify-end gap-0.5">
                    <DropdownIcon
                      item={item}
                      onDelete={handleOpenDeleteDialog}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        <PaginationCardMinimal
          align="right"
          page={currentPage}
          total={totalPages}
          onPageChange={handlePageChange}
          className="px-4 py-3 md:px-5 md:pt-3 md:pb-4"
        />

        <AlertDialogDestructive
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setMemberToDelete(null);
            }
          }}
          memberName={memberToDelete ?? undefined}
          onConfirm={handleDelete}
        />
      </TableCard.Root>
    );
};
