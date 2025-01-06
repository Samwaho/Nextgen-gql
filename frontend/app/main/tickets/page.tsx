"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { TicketProps } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateTicketForm from "@/app/main/tickets/CreateTicketForm";
import EditTicketForm from "@/app/main/tickets/EditTicketForm";
import {
  Ticket,
  Pencil,
  User,
  Clock,
  UserCircle2,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@apollo/client";
import { GET_TICKETS, UPDATE_TICKET, useTicket } from "@/graphql/ticket";
import { GET_EMPLOYEES, Employee } from "@/graphql/employee";
import {
  format,
  isValid,
  parseISO,
  startOfToday,
  startOfYesterday,
  subDays,
  isAfter,
  isBefore,
  endOfDay,
} from "date-fns";
import { GET_CUSTOMERS, Customer } from "@/graphql/customer";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

type DateFilter = "all" | "today" | "yesterday" | "last7days" | "last30days";

export default function TicketsPage() {
  const {
    data: ticketsData,
    error,
    loading: isLoading,
  } = useQuery(GET_TICKETS);

  const [updateTicketStatus] = useMutation(UPDATE_TICKET, {
    onCompleted: () => {
      toast.success("Ticket status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    },
    refetchQueries: [{ query: GET_TICKETS }],
  });

  const [ticketList, setTicketList] = useState<TicketProps[]>([]);
  const [draggedTicket, setDraggedTicket] = useState<TicketProps | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  useEffect(() => {
    if (ticketsData?.tickets) {
      let filteredTickets = [...ticketsData.tickets];

      switch (dateFilter) {
        case "today":
          filteredTickets = filteredTickets.filter((ticket) => {
            const ticketDate = parseISO(ticket.createdAt);
            return (
              isAfter(ticketDate, startOfToday()) &&
              isBefore(ticketDate, endOfDay(new Date()))
            );
          });
          break;
        case "yesterday":
          filteredTickets = filteredTickets.filter((ticket) => {
            const ticketDate = parseISO(ticket.createdAt);
            return (
              isAfter(ticketDate, startOfYesterday()) &&
              isBefore(ticketDate, startOfToday())
            );
          });
          break;
        case "last7days":
          filteredTickets = filteredTickets.filter((ticket) => {
            const ticketDate = parseISO(ticket.createdAt);
            return isAfter(ticketDate, subDays(startOfToday(), 7));
          });
          break;
        case "last30days":
          filteredTickets = filteredTickets.filter((ticket) => {
            const ticketDate = parseISO(ticket.createdAt);
            return isAfter(ticketDate, subDays(startOfToday(), 30));
          });
          break;
        default:
          break;
      }

      setTicketList(filteredTickets);
    }
  }, [ticketsData, dateFilter]);

  useEffect(() => {
    if (error) {
      toast.error("An error occurred while fetching tickets");
      console.error("Error fetching tickets:", error);
    }
  }, [error]);

  const handleDragStart = (ticket: TicketProps, e: React.DragEvent) => {
    setDraggedTicket(ticket);
    if (e.dataTransfer.setDragImage) {
      const ghostElement = e.currentTarget.cloneNode(true) as HTMLElement;
      ghostElement.style.position = "absolute";
      ghostElement.style.top = "-1000px";
      document.body.appendChild(ghostElement);
      e.dataTransfer.setDragImage(ghostElement, 0, 0);
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: "open" | "in-progress" | "closed") => {
    if (draggedTicket) {
      try {
        await updateTicketStatus({
          variables: {
            id: draggedTicket.id,
            ticketInput: {
              status,
            },
          },
        });
        setTicketList((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === draggedTicket.id ? { ...ticket, status } : ticket
          )
        );
      } catch (error) {
        console.error("Error updating ticket status:", error);
      }
      setDraggedTicket(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((column) => (
            <div key={column} className="space-y-4">
              <div className="bg-card_light dark:bg-card_dark rounded-t-lg p-2">
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="bg-card_light dark:bg-card_dark p-2 min-h-[200px] rounded-b-lg space-y-4">
                {[1, 2].map((card) => (
                  <div
                    key={card}
                    className="bg-background rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-8 w-[200px]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalTickets = ticketList.length;
  const openTickets = ticketList.filter(
    (ticket) => ticket.status === "open"
  ).length;
  const inProgressTickets = ticketList.filter(
    (ticket) => ticket.status === "in-progress"
  ).length;
  const closedTickets = ticketList.filter(
    (ticket) => ticket.status === "closed"
  ).length;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold">
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            page/{" "}
          </span>
          Support Tickets
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate()}
        </p>
      </div>

      <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
        <TicketCard
          title="Total Tickets"
          count={totalTickets}
          description="All tickets"
        />
        <TicketCard
          title="Open Tickets"
          count={openTickets}
          description="Tickets that are open"
        />
        <TicketCard
          title="In Progress Tickets"
          count={inProgressTickets}
          description="Tickets in progress"
        />
        <TicketCard
          title="Closed Tickets"
          count={closedTickets}
          description="Tickets that are closed"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h4 className="text-base md:text-lg font-semibold">Tickets Table</h4>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <Select
              value={dateFilter}
              onValueChange={(value: DateFilter) => setDateFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-custom flex items-center gap-2 px-3 py-2 text-sm md:text-base text-white rounded-md w-auto sm:w-auto">
              <Ticket className="h-4 w-4" />
              <p>Add New</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ticket</DialogTitle>
              <DialogDescription>
                Fill in the fields below to add a new ticket
              </DialogDescription>
            </DialogHeader>
            <CreateTicketForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <div className="mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <TicketColumn
              title="To Do"
              tickets={ticketList.filter((ticket) => ticket.status === "open")}
              handleDragOver={handleDragOver}
              handleDrop={() => handleDrop("open")}
              handleDragStart={handleDragStart}
            />
            <TicketColumn
              title="In Progress"
              tickets={ticketList.filter(
                (ticket) => ticket.status === "in-progress"
              )}
              handleDragOver={handleDragOver}
              handleDrop={() => handleDrop("in-progress")}
              handleDragStart={handleDragStart}
            />
            <TicketColumn
              title="Completed"
              tickets={ticketList.filter(
                (ticket) => ticket.status === "closed"
              )}
              handleDragOver={handleDragOver}
              handleDrop={() => handleDrop("closed")}
              handleDragStart={handleDragStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-1.5 sm:gap-2 shadow-md p-2 sm:p-3 flex-1 min-w-[120px] sm:min-w-[150px] max-w-[200px] sm:max-w-[250px]">
      <div className="flex justify-between items-start">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div className="p-0.5 sm:p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
          <Ticket className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
      </div>
      <h1 className="font-bold text-base sm:text-lg">{count}</h1>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function formatTicketDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No date";
  try {
    const date = parseISO(dateStr);
    return isValid(date)
      ? format(date, "MMM d, yyyy 'at' h:mm a")
      : "Invalid date";
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid date";
  }
}

function TicketColumn({
  title,
  tickets,
  handleDragOver,
  handleDrop,
  handleDragStart,
}: {
  title: string;
  tickets: TicketProps[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: () => void;
  handleDragStart: (ticket: TicketProps, e: React.DragEvent) => void;
}) {
  const { data: employeesData } = useQuery<{ staffMembers: Employee[] }>(
    GET_EMPLOYEES
  );
  const { data: customersData } = useQuery<{ customers: Customer[] }>(
    GET_CUSTOMERS
  );
  const { deleteTicket } = useTicket();
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTicket(ticketToDelete);
      toast.success("Ticket deleted successfully");
      setTicketToDelete(null);
    } catch (error) {
      toast.error("Failed to delete ticket");
      console.error("Error deleting ticket:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const [updateTicket] = useMutation(UPDATE_TICKET, {
    onCompleted: (data) => {
      const isUnassigned =
        data.updateTicket.assignedEmployee === null ||
        data.updateTicket.assignedEmployee === undefined;
      toast.success(
        isUnassigned
          ? "Employee unassigned successfully"
          : "Employee assigned successfully"
      );
    },
    onError: (error) => {
      toast.error("Failed to update employee assignment");
      console.error("Error updating employee assignment:", error);
    },
    refetchQueries: [{ query: GET_TICKETS }],
  });

  const handleAssignEmployee = async (
    ticketId: string,
    employeeId: string | null
  ) => {
    try {
      await updateTicket({
        variables: {
          id: ticketId,
          ticketInput: {
            assignedEmployee: employeeId,
          },
        },
      });
    } catch (error) {
      console.error("Error updating employee assignment:", error);
    }
  };

  return (
    <div className="" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="bg-card_light dark:bg-card_dark rounded-t-lg p-2">
        <h2 className="text-base sm:text-lg font-semibold text-fuchsia-500 dark:text-fuchsia-400">
          {title}
        </h2>
      </div>
      <div className="bg-card_light dark:bg-card_dark mt-2 rounded-b-lg p-2 min-h-[200px]">
        {tickets.map((ticket) => {
          const ticketData = {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            customer:
              typeof ticket.customer === "string"
                ? ticket.customer
                : ticket.customer.id,
            assignedEmployee:
              ticket.assignedEmployee === null
                ? null
                : typeof ticket.assignedEmployee === "object"
                ? ticket.assignedEmployee.id
                : ticket.assignedEmployee,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
          };

          const assignedEmployee = employeesData?.staffMembers?.find(
            (emp: Employee) => emp.id === ticketData.assignedEmployee
          );

          const customer = customersData?.customers?.find(
            (c: Customer) => c.id === ticketData.customer
          );

          return (
            <Card
              key={ticket.id}
              className="mb-3 sm:mb-4 cursor-move hover:shadow-md transition-shadow"
              draggable
              onDragStart={(e) => handleDragStart(ticket, e)}
            >
              <CardHeader className="p-3 sm:p-4">
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <Badge
                        className={
                          ticket.priority === "high"
                            ? "bg-red-500"
                            : ticket.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          ticket.status === "open"
                            ? "border-blue-500 text-blue-500"
                            : ticket.status === "in-progress"
                            ? "border-orange-500 text-orange-500"
                            : "border-green-500 text-green-500"
                        }
                      >
                        {ticket.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">
                      {ticket.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Ticket</DialogTitle>
                          <DialogDescription>
                            Update the ticket details below
                          </DialogDescription>
                        </DialogHeader>
                        <EditTicketForm ticket={ticketData} />
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={ticketToDelete === ticket.id}
                      onOpenChange={(open) => !open && setTicketToDelete(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTicketToDelete(ticket.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Ticket</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this ticket? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setTicketToDelete(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteTicket}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mt-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {customer
                        ? `${customer.name} (${customer.email})`
                        : "Loading customer..."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    <Select
                      value={assignedEmployee?.id || "unassigned"}
                      onValueChange={(value) =>
                        handleAssignEmployee(
                          ticket.id,
                          value === "unassigned" ? null : value
                        )
                      }
                    >
                      <SelectTrigger className="h-7 sm:h-8 text-xs sm:text-sm">
                        <SelectValue placeholder="Assign employee">
                          {assignedEmployee?.name || "Unassigned"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassign</SelectItem>
                        {employeesData?.staffMembers?.map(
                          (employee: Employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatTicketDate(ticketData.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
