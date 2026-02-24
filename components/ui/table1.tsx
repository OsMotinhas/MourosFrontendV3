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

type QuotaStatus = "hidden" | "paid" | "unpaid" | "waived";

const getQuotaStatus = (value: unknown): QuotaStatus => {
  if (value === null || value === undefined) {
    return "hidden";
  }

  if (typeof value === "boolean") {
    return value ? "paid" : "unpaid";
  }

  const normalizedValue = formatForSearch(String(value));

  if (!normalizedValue || normalizedValue === "-") {
    return "hidden";
  }

  if (normalizedValue === "pago" || normalizedValue === "true") {
    return "paid";
  }

  if (normalizedValue === "nao pago" || normalizedValue === "false") {
    return "unpaid";
  }

  if (normalizedValue === "dispensado") {
    return "waived";
  }

  return "waived";
};

const renderQuotaBadge = (year: string, value: unknown) => {
  const quotaStatus = getQuotaStatus(value);

  if (quotaStatus === "hidden") {
    return null;
  }

  const colorMap: Record<Exclude<QuotaStatus, "hidden">, BadgeColor<"color">> = {
    paid: "success",
    unpaid: "error",
    waived: "gray",
  };

  return (
    <Badge type="color" color={colorMap[quotaStatus]} size="sm">
      {year}
    </Badge>
  );
};

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

            // Compare numbers
            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "descending" ? second - first : first - second;
            }

            // Compare booleans as 0/1
            if (typeof first === "boolean" && typeof second === "boolean") {
                const firstValue = Number(first);
                const secondValue = Number(second);
                return sortDescriptor.direction === "descending"
                  ? secondValue - firstValue
                  : firstValue - secondValue;
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
          /*selectionMode="multiple"*/ //Tirar comentario para ativar seleção de linhas
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
        >
          <Table.Header>
            <Table.Head
              id="numeroSocio"
              label="Nº"
              allowsSorting
              className="whitespace-nowrap w-10  max-w-1/12"
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
            <Table.Head id="joiaPaga" label="Jóia" />
            <Table.Head id="quota2025Paga" label="Quotas" allowsSorting />
            <Table.Head
              id="adicionadoWhatsApp"
              label="WhatsApp"
              allowsSorting
            />
            <Table.Head id="kitEntregue" label="Kit" allowsSorting />
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
                  {item.joiaPaga === false ? (
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      {/* contorno + detalhes (sem preenchimento) */}
                      <path
                        d="M12.6141 20.2625L21.5727 9.51215C21.7246 9.32995 21.8005 9.23885 21.8295 9.13717C21.8551 9.04751 21.8551 8.95249 21.8295 8.86283C21.8005 8.76114 21.7246 8.67005 21.5727 8.48785L17.2394 3.28785C17.1512 3.18204 17.1072 3.12914 17.0531 3.09111C17.0052 3.05741 16.9518 3.03238 16.8953 3.01717C16.8314 3 16.7626 3 16.6248 3H7.37424C7.2365 3 7.16764 3 7.10382 3.01717C7.04728 3.03238 6.99385 3.05741 6.94596 3.09111C6.89192 3.12914 6.84783 3.18204 6.75966 3.28785L2.42633 8.48785C2.2745 8.67004 2.19858 8.76114 2.16957 8.86283C2.144 8.95249 2.144 9.04751 2.16957 9.13716C2.19858 9.23885 2.2745 9.32995 2.42633 9.51215L11.385 20.2625C11.596 20.5158 11.7015 20.6424 11.8279 20.6886C11.9387 20.7291 12.0603 20.7291 12.1712 20.6886C12.2975 20.6424 12.4031 20.5158 12.6141 20.2625Z"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.85"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M2.49954 9H21.4995"
                        stroke="currentColor"
                        strokeOpacity="0.55"
                        strokeWidth="1.05"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.99954 3L7.99954 9L11.9995 20.5L15.9995 9L13.9995 3"
                        stroke="currentColor"
                        strokeOpacity="0.5"
                        strokeWidth="1.05"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <defs>
                        {/* verde “realista” (ligeiro brilho) */}
                        <linearGradient
                          id="diamondPaid"
                          x1="6"
                          y1="3"
                          x2="18.5"
                          y2="21"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0" stopColor="#34d399" />
                          <stop offset="0.55" stopColor="#22c55e" />
                          <stop offset="1" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>

                      {/* base solid */}
                      <path
                        d="M12.6141 20.2625L21.5727 9.51215C21.7246 9.32995 21.8005 9.23885 21.8295 9.13717C21.8551 9.04751 21.8551 8.95249 21.8295 8.86283C21.8005 8.76114 21.7246 8.67005 21.5727 8.48785L17.2394 3.28785C17.1512 3.18204 17.1072 3.12914 17.0531 3.09111C17.0052 3.05741 16.9518 3.03238 16.8953 3.01717C16.8314 3 16.7626 3 16.6248 3H7.37424C7.2365 3 7.16764 3 7.10382 3.01717C7.04728 3.03238 6.99385 3.05741 6.94596 3.09111C6.89192 3.12914 6.84783 3.18204 6.75966 3.28785L2.42633 8.48785C2.2745 8.67004 2.19858 8.76114 2.16957 8.86283C2.144 8.95249 2.144 9.04751 2.16957 9.13716C2.19858 9.23885 2.2745 9.32995 2.42633 9.51215L11.385 20.2625C11.596 20.5158 11.7015 20.6424 11.8279 20.6886C11.9387 20.7291 12.0603 20.7291 12.1712 20.6886C12.2975 20.6424 12.4031 20.5158 12.6141 20.2625Z"
                        fill="url(#diamondPaid)"
                      />

                      {/* contorno subtil */}
                      <path
                        d="M12.6141 20.2625L21.5727 9.51215C21.7246 9.32995 21.8005 9.23885 21.8295 9.13717C21.8551 9.04751 21.8551 8.95249 21.8295 8.86283C21.8005 8.76114 21.7246 8.67005 21.5727 8.48785L17.2394 3.28785C17.1512 3.18204 17.1072 3.12914 17.0531 3.09111C17.0052 3.05741 16.9518 3.03238 16.8953 3.01717C16.8314 3 16.7626 3 16.6248 3H7.37424C7.2365 3 7.16764 3 7.10382 3.01717C7.04728 3.03238 6.99385 3.05741 6.94596 3.09111C6.89192 3.12914 6.84783 3.18204 6.75966 3.28785L2.42633 8.48785C2.2745 8.67004 2.19858 8.76114 2.16957 8.86283C2.144 8.95249 2.144 9.04751 2.16957 9.13716C2.19858 9.23885 2.2745 9.32995 2.42633 9.51215L11.385 20.2625C11.596 20.5158 11.7015 20.6424 11.8279 20.6886C11.9387 20.7291 12.0603 20.7291 12.1712 20.6886C12.2975 20.6424 12.4031 20.5158 12.6141 20.2625Z"
                        fill="none"
                        stroke="#064e3b"
                        strokeOpacity="0.22"
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />

                      {/* detalhes internos discretos (finos e claros) */}
                      <path
                        d="M2.49954 9H21.4995"
                        stroke="#ffffff"
                        strokeOpacity="0.38"
                        strokeWidth="1.05"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.99954 3L7.99954 9L11.9995 20.5L15.9995 9L13.9995 3"
                        stroke="#ffffff"
                        strokeOpacity="0.34"
                        strokeWidth="1.05"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  <div className="flex flex-row items-center gap-2">
                    {renderQuotaBadge("2025", item.quota2025Paga)}
                    {renderQuotaBadge("2026", item.quota2026Paga)}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {item.adicionadoWhatsApp ? (
                    <svg
                      fill="#25D366"
                      width="24px"
                      height="24px"
                      viewBox="0 0 32 32"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <title>whatsapp</title>
                      <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path>
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <title>whatsapp</title>
                      <path
                        d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  {item.kitEntregue ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.52 2.64L3.96 4.72C3.65102 5.13198 3.49652 5.33797 3.50011 5.51039C3.50323 5.66044 3.57358 5.80115 3.69175 5.89368C3.82754 6 4.08503 6 4.6 6H19.4C19.915 6 20.1725 6 20.3083 5.89368C20.4264 5.80115 20.4968 5.66044 20.4999 5.51039C20.5035 5.33797 20.349 5.13198 20.04 4.72L18.48 2.64M5.52 2.64C5.696 2.40533 5.784 2.288 5.89552 2.20338C5.9943 2.12842 6.10616 2.0725 6.22539 2.03845C6.36 2 6.50667 2 6.8 2H17.2C17.4933 2 17.64 2 17.7746 2.03845C17.8938 2.0725 18.0057 2.12842 18.1045 2.20338C18.216 2.288 18.304 2.40533 18.48 2.64M5.52 2.64L3.64 5.14666C3.40254 5.46328 3.28381 5.62159 3.1995 5.79592C3.12469 5.95062 3.07012 6.11431 3.03715 6.28296C3 6.47301 3 6.6709 3 7.06666L3 18.8C3 19.9201 3 20.4802 3.21799 20.908C3.40973 21.2843 3.71569 21.5903 4.09202 21.782C4.51984 22 5.07989 22 6.2 22L17.8 22C18.9201 22 19.4802 22 19.908 21.782C20.2843 21.5903 20.5903 21.2843 20.782 20.908C21 20.4802 21 19.9201 21 18.8V7.06667C21 6.6709 21 6.47301 20.9628 6.28296C20.9299 6.11431 20.8753 5.95062 20.8005 5.79592C20.7162 5.62159 20.5975 5.46328 20.36 5.14667L18.48 2.64M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.52 2.64L3.96 4.72C3.65102 5.13198 3.49652 5.33797 3.50011 5.51039C3.50323 5.66044 3.57358 5.80115 3.69175 5.89368C3.82754 6 4.08503 6 4.6 6H19.4C19.915 6 20.1725 6 20.3083 5.89368C20.4264 5.80115 20.4968 5.66044 20.4999 5.51039C20.5035 5.33797 20.349 5.13198 20.04 4.72L18.48 2.64M5.52 2.64C5.696 2.40533 5.784 2.288 5.89552 2.20338C5.9943 2.12842 6.10616 2.0725 6.22539 2.03845C6.36 2 6.50667 2 6.8 2H17.2C17.4933 2 17.64 2 17.7746 2.03845C17.8938 2.0725 18.0057 2.12842 18.1045 2.20338C18.216 2.288 18.304 2.40533 18.48 2.64M5.52 2.64L3.64 5.14666C3.40254 5.46328 3.28381 5.62159 3.1995 5.79592C3.12469 5.95062 3.07012 6.11431 3.03715 6.28296C3 6.47301 3 6.6709 3 7.06666L3 18.8C3 19.9201 3 20.4802 3.21799 20.908C3.40973 21.2843 3.71569 21.5903 4.09202 21.782C4.51984 22 5.07989 22 6.2 22L17.8 22C18.9201 22 19.4802 22 19.908 21.782C20.2843 21.5903 20.5903 21.2843 20.782 20.908C21 20.4802 21 19.9201 21 18.8V7.06667C21 6.6709 21 6.47301 20.9628 6.28296C20.9299 6.11431 20.8753 5.95062 20.8005 5.79592C20.7162 5.62159 20.5975 5.46328 20.36 5.14667L18.48 2.64M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                        fill="#e5e7eb"
                      />

                      <path
                        d="M5.52 2.64L3.96 4.72C3.65102 5.13198 3.49652 5.33797 3.50011 5.51039C3.50323 5.66044 3.57358 5.80115 3.69175 5.89368C3.82754 6 4.08503 6 4.6 6H19.4C19.915 6 20.1725 6 20.3083 5.89368C20.4264 5.80115 20.4968 5.66044 20.4999 5.51039C20.5035 5.33797 20.349 5.13198 20.04 4.72L18.48 2.64M5.52 2.64C5.696 2.40533 5.784 2.288 5.89552 2.20338C5.9943 2.12842 6.10616 2.0725 6.22539 2.03845C6.36 2 6.50667 2 6.8 2H17.2C17.4933 2 17.64 2 17.7746 2.03845C17.8938 2.0725 18.0057 2.12842 18.1045 2.20338C18.216 2.288 18.304 2.40533 18.48 2.64M5.52 2.64L3.64 5.14666C3.40254 5.46328 3.28381 5.62159 3.1995 5.79592C3.12469 5.95062 3.07012 6.11431 3.03715 6.28296C3 6.47301 3 6.6709 3 7.06666L3 18.8C3 19.9201 3 20.4802 3.21799 20.908C3.40973 21.2843 3.71569 21.5903 4.09202 21.782C4.51984 22 5.07989 22 6.2 22L17.8 22C18.9201 22 19.4802 22 19.908 21.782C20.2843 21.5903 20.5903 21.2843 20.782 20.908C21 20.4802 21 19.9201 21 18.8V7.06667C21 6.6709 21 6.47301 20.9628 6.28296C20.9299 6.11431 20.8753 5.95062 20.8005 5.79592C20.7162 5.62159 20.5975 5.46328 20.36 5.14667L18.48 2.64M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                        stroke="#111827"
                        strokeOpacity="0.28"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
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
