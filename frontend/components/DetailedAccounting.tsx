import React from "react";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMER_ACCOUNTING, AccountingData } from "@/graphql/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Download,
  Upload,
  Network,
  Layers,
  Clock,
  Activity,
} from "lucide-react";

interface DetailedAccountingProps {
  username: string;
}

export function DetailedAccounting({ username }: DetailedAccountingProps) {
  const { data, loading } = useQuery<{ customerAccounting: AccountingData }>(
    GET_CUSTOMER_ACCOUNTING,
    {
      variables: { username },
      pollInterval: 10000, // Poll every 10 seconds for updates
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-fuchsia-500 dark:text-fuchsia-400" />
      </div>
    );
  }

  if (!data?.customerAccounting) {
    return null;
  }

  const accounting = data.customerAccounting;

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    return parts.join(" ");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
            <Activity className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
          </div>
          <span className="text-foreground">Detailed Accounting</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-6">
          {/* Session Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/20">
                <Clock className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground">Session Information</h3>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Status</TableCell>
                    <TableCell className="text-foreground">{accounting.status}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Session ID</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.sessionId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Session Time</TableCell>
                    <TableCell className="text-foreground">{formatDuration(accounting.sessionTime)}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Session Hours</TableCell>
                    <TableCell className="text-foreground">{accounting.sessionTimeHours.toFixed(2)} hours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Idle Timeout</TableCell>
                    <TableCell className="text-foreground">{formatDuration(accounting.idleTimeout)}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Session Timeout</TableCell>
                    <TableCell className="text-foreground">{formatDuration(accounting.sessionTimeout)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Data Usage */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/20">
                <Activity className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground">Data Usage</h3>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Direction</TableHead>
                    <TableHead>Bytes</TableHead>
                    <TableHead>Packets</TableHead>
                    <TableHead>Gigawords</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/20">
                          <Download className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <span className="text-foreground">Download</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{formatBytes(accounting.inputOctets)}</TableCell>
                    <TableCell className="text-foreground">{accounting.inputPackets.toLocaleString()}</TableCell>
                    <TableCell className="text-foreground">{accounting.inputGigawords}</TableCell>
                    <TableCell className="font-medium text-emerald-500 dark:text-emerald-400">
                      {formatBytes(accounting.totalInputBytes)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-sky-100 dark:bg-sky-900/20">
                          <Upload className="h-3 w-3 text-sky-500 dark:text-sky-400" />
                        </div>
                        <span className="text-foreground">Upload</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{formatBytes(accounting.outputOctets)}</TableCell>
                    <TableCell className="text-foreground">{accounting.outputPackets.toLocaleString()}</TableCell>
                    <TableCell className="text-foreground">{accounting.outputGigawords}</TableCell>
                    <TableCell className="font-medium text-sky-500 dark:text-sky-400">
                      {formatBytes(accounting.totalOutputBytes)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/20">
                          <Layers className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                        </div>
                        <span className="text-foreground">Total</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatBytes(accounting.inputOctets + accounting.outputOctets)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {(accounting.inputPackets + accounting.outputPackets).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {accounting.inputGigawords + accounting.outputGigawords}
                    </TableCell>
                    <TableCell className="font-medium text-fuchsia-500 dark:text-fuchsia-400">
                      {formatBytes(accounting.totalBytes)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Network Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/20">
                <Network className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground">Network Details</h3>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Framed IP</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.framedIpAddress}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Rate Limit</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.mikrotikRateLimit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Called Station</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.calledStationId}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Calling Station</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.callingStationId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">NAS IP</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.nasIpAddress}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">NAS Identifier</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.nasIdentifier}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">NAS Port</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.nasPort}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">NAS Port Type</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.nasPortType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Service Type</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.serviceType}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">Framed Protocol</TableCell>
                    <TableCell className="font-mono text-sm text-foreground">{accounting.framedProtocol}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 