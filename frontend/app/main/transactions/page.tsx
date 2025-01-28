"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_TRANSACTIONS, MpesaTransaction, TransactionFilter, useTransactions, B2CPaymentInput, B2BPaymentInput } from "@/graphql/transactions";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, BanknoteIcon, ClockIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100",
  validated: "bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-blue-100",
  completed: "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100",
  timeout: "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100",
  invalidated: "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100",
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isB2CDialogOpen, setIsB2CDialogOpen] = useState(false);
  const [isB2BDialogOpen, setIsB2BDialogOpen] = useState(false);
  const [b2cForm, setB2CForm] = useState<B2CPaymentInput>({
    phone: "",
    amount: 0,
    reference: "",
    remarks: ""
  });
  const [b2bForm, setB2BForm] = useState<B2BPaymentInput>({
    receiverShortcode: "",
    amount: 0,
    reference: "",
    remarks: ""
  });

  const { data, loading, error } = useQuery(GET_TRANSACTIONS, {
    variables: { filter },
    pollInterval: 10000,
  });

  const { initiateB2CPayment, initiateB2BPayment, isInitiatingB2C, isInitiatingB2B } = useTransactions();

  const handleFilterChange = (key: keyof TransactionFilter, value: string) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value || undefined,
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilter((prev) => ({
      ...prev,
      startDate: range?.from ? format(new Date(range.from), "yyyy-MM-dd") : undefined,
      endDate: range?.to ? format(new Date(range.to), "yyyy-MM-dd") : undefined,
    }));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const handleB2CSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await initiateB2CPayment(b2cForm);
      if (response?.success) {
        toast.success(response.message);
        setIsB2CDialogOpen(false);
        setB2CForm({
          phone: "",
          amount: 0,
          reference: "",
          remarks: ""
        });
      } else {
        toast.error(response?.message || "Failed to initiate B2C payment");
      }
    } catch {
      toast.error("Failed to initiate B2C payment");
    }
  };

  const handleB2BSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await initiateB2BPayment(b2bForm);
      if (response?.success) {
        toast.success(response.message);
        setIsB2BDialogOpen(false);
        setB2BForm({
          receiverShortcode: "",
          amount: 0,
          reference: "",
          remarks: ""
        });
      } else {
        toast.error(response?.message || "Failed to initiate B2B payment");
      }
    } catch {
      toast.error("Failed to initiate B2B payment");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/20">
          <BanknoteIcon className="h-12 w-12 text-rose-500 dark:text-rose-400" />
        </div>
        <p className="text-sm text-rose-500 dark:text-rose-400 mt-4">Error loading transactions</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-2 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20"
        >
          Try again
        </Button>
      </div>
    );
  }

  const transactions = data?.mpesaTransactions || [];
  const totalAmount = transactions.reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);
  const incomingAmount = transactions
    .filter((t: MpesaTransaction) => t.type === "c2b" && t.status === "completed")
    .reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);
  const outgoingAmount = transactions
    .filter((t: MpesaTransaction) => (t.type === "b2c" || t.type === "b2b") && t.status === "completed")
    .reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);
  const pendingTransactions = transactions.filter((t: MpesaTransaction) => t.status === "pending");

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-muted-foreground">page/ </span>
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Transactions
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <BanknoteIcon className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{formatAmount(totalAmount)}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">All transactions</p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Incoming</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <ArrowDownIcon className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{formatAmount(incomingAmount)}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Received payments</p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Outgoing</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <ArrowUpIcon className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{formatAmount(outgoingAmount)}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Sent payments</p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <ClockIcon className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">
            {pendingTransactions.length}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">Awaiting completion</p>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          Transaction History
        </h4>
        <div className="flex gap-2">
          <Dialog open={isB2CDialogOpen} onOpenChange={setIsB2CDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 text-white">Send to Customer</Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">Business to Customer Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleB2CSubmit} className="space-y-4">
                <Input
                  placeholder="Phone Number"
                  value={b2cForm.phone}
                  onChange={(e) => setB2CForm({ ...b2cForm, phone: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={b2cForm.amount || ""}
                  onChange={(e) => setB2CForm({ ...b2cForm, amount: parseFloat(e.target.value) })}
                  required
                  className="bg-background"
                />
                <Input
                  placeholder="Reference"
                  value={b2cForm.reference}
                  onChange={(e) => setB2CForm({ ...b2cForm, reference: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  placeholder="Remarks"
                  value={b2cForm.remarks}
                  onChange={(e) => setB2CForm({ ...b2cForm, remarks: e.target.value })}
                  required
                  className="bg-background"
                />
                <Button 
                  type="submit" 
                  disabled={isInitiatingB2C}
                  className="w-full bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 text-white"
                >
                  {isInitiatingB2C ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Send Payment"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isB2BDialogOpen} onOpenChange={setIsB2BDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 text-white">Send to Business</Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">Business to Business Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleB2BSubmit} className="space-y-4">
                <Input
                  placeholder="Receiver Shortcode"
                  value={b2bForm.receiverShortcode}
                  onChange={(e) => setB2BForm({ ...b2bForm, receiverShortcode: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={b2bForm.amount || ""}
                  onChange={(e) => setB2BForm({ ...b2bForm, amount: parseFloat(e.target.value) })}
                  required
                  className="bg-background"
                />
                <Input
                  placeholder="Reference"
                  value={b2bForm.reference}
                  onChange={(e) => setB2BForm({ ...b2bForm, reference: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  placeholder="Remarks"
                  value={b2bForm.remarks}
                  onChange={(e) => setB2BForm({ ...b2bForm, remarks: e.target.value })}
                  required
                  className="bg-background"
                />
                <Button 
                  type="submit" 
                  disabled={isInitiatingB2B}
                  className="w-full bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 text-white"
                >
                  {isInitiatingB2B ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Send Payment"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-4">
        <Tabs defaultValue="all" className="">
          <TabsList className="mx-auto bg-card">
            <TabsTrigger value="all" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">ALL</TabsTrigger>
            <TabsTrigger value="c2b" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">INCOMING</TabsTrigger>
            <TabsTrigger value="outgoing" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">OUTGOING</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-4 py-6 rounded-xl shadow-md">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Input
                  placeholder="Search by phone..."
                  onChange={(e) => handleFilterChange("phone", e.target.value)}
                  value={filter.phone || ""}
                  className="bg-background"
                />
                <Input
                  placeholder="Search by reference..."
                  onChange={(e) => handleFilterChange("reference", e.target.value)}
                  value={filter.reference || ""}
                  className="bg-background"
                />
                <Select
                  onValueChange={(value) => handleFilterChange("status", value)}
                  value={filter.status || ""}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                    <SelectItem value="invalidated">Invalidated</SelectItem>
                  </SelectContent>
                </Select>
                <DatePickerWithRange date={dateRange} onSelect={handleDateRangeChange} />
              </div>

              {/* Transactions Table */}
              <div className="rounded-md border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-fuchsia-500">Date</TableHead>
                      <TableHead className="text-fuchsia-500">Reference</TableHead>
                      <TableHead className="text-fuchsia-500">Customer</TableHead>
                      <TableHead className="text-fuchsia-500">Phone</TableHead>
                      <TableHead className="text-fuchsia-500">Amount</TableHead>
                      <TableHead className="text-fuchsia-500">Status</TableHead>
                      <TableHead className="text-fuchsia-500">Receipt</TableHead>
                      <TableHead className="text-fuchsia-500">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction: MpesaTransaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(new Date(transaction.createdAt))}</TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.customerUsername || "-"}</TableCell>
                          <TableCell>{transaction.phone || transaction.receiverShortcode || "-"}</TableCell>
                          <TableCell>{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                statusColors[
                                  transaction.status as keyof typeof statusColors
                                ]
                              } px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.mpesaReceipt || "-"}</TableCell>
                          <TableCell>{transaction.remarks || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="c2b">
            <div className="glass-card mt-2 px-4 py-6 rounded-xl shadow-md">
              <div className="rounded-md border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-fuchsia-500">Date</TableHead>
                      <TableHead className="text-fuchsia-500">Reference</TableHead>
                      <TableHead className="text-fuchsia-500">Customer</TableHead>
                      <TableHead className="text-fuchsia-500">Phone</TableHead>
                      <TableHead className="text-fuchsia-500">Amount</TableHead>
                      <TableHead className="text-fuchsia-500">Status</TableHead>
                      <TableHead className="text-fuchsia-500">Receipt</TableHead>
                      <TableHead className="text-fuchsia-500">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter((t: MpesaTransaction) => t.type === "c2b")
                      .map((transaction: MpesaTransaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(new Date(transaction.createdAt))}</TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.customerUsername || "-"}</TableCell>
                          <TableCell>{transaction.phone || "-"}</TableCell>
                          <TableCell>{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                statusColors[
                                  transaction.status as keyof typeof statusColors
                                ]
                              } px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.mpesaReceipt || "-"}</TableCell>
                          <TableCell>{transaction.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="outgoing">
            <div className="glass-card mt-2 px-4 py-6 rounded-xl shadow-md">
              <div className="rounded-md border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-fuchsia-500">Date</TableHead>
                      <TableHead className="text-fuchsia-500">Reference</TableHead>
                      <TableHead className="text-fuchsia-500">Customer</TableHead>
                      <TableHead className="text-fuchsia-500">Phone</TableHead>
                      <TableHead className="text-fuchsia-500">Amount</TableHead>
                      <TableHead className="text-fuchsia-500">Status</TableHead>
                      <TableHead className="text-fuchsia-500">Receipt</TableHead>
                      <TableHead className="text-fuchsia-500">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter((t: MpesaTransaction) => t.type === "b2c" || t.type === "b2b")
                      .map((transaction: MpesaTransaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(new Date(transaction.createdAt))}</TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell>{transaction.customerUsername || "-"}</TableCell>
                          <TableCell>{transaction.phone || "-"}</TableCell>
                          <TableCell>{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                statusColors[
                                  transaction.status as keyof typeof statusColors
                                ]
                              } px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.mpesaReceipt || "-"}</TableCell>
                          <TableCell>{transaction.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
