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
import { Loader2 } from "lucide-react";

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
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">Detailed Accounting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Session Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Session Information</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{accounting.status}</TableCell>
                  <TableCell className="font-medium">Session ID</TableCell>
                  <TableCell>{accounting.sessionId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Session Time</TableCell>
                  <TableCell>{formatDuration(accounting.sessionTime)}</TableCell>
                  <TableCell className="font-medium">Session Hours</TableCell>
                  <TableCell>{accounting.sessionTimeHours.toFixed(2)} hours</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Idle Timeout</TableCell>
                  <TableCell>{formatDuration(accounting.idleTimeout)}</TableCell>
                  <TableCell className="font-medium">Session Timeout</TableCell>
                  <TableCell>{formatDuration(accounting.sessionTimeout)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Data Usage */}
          <div>
            <h3 className="text-sm font-medium mb-2">Data Usage</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Bytes</TableHead>
                  <TableHead>Packets</TableHead>
                  <TableHead>Gigawords</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Download</TableCell>
                  <TableCell>{formatBytes(accounting.inputOctets)}</TableCell>
                  <TableCell>{accounting.inputPackets.toLocaleString()}</TableCell>
                  <TableCell>{accounting.inputGigawords}</TableCell>
                  <TableCell>{formatBytes(accounting.totalInputBytes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Upload</TableCell>
                  <TableCell>{formatBytes(accounting.outputOctets)}</TableCell>
                  <TableCell>{accounting.outputPackets.toLocaleString()}</TableCell>
                  <TableCell>{accounting.outputGigawords}</TableCell>
                  <TableCell>{formatBytes(accounting.totalOutputBytes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell>
                    {formatBytes(accounting.inputOctets + accounting.outputOctets)}
                  </TableCell>
                  <TableCell>
                    {(accounting.inputPackets + accounting.outputPackets).toLocaleString()}
                  </TableCell>
                  <TableCell>{accounting.inputGigawords + accounting.outputGigawords}</TableCell>
                  <TableCell>{formatBytes(accounting.totalBytes)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Network Details */}
          <div>
            <h3 className="text-sm font-medium mb-2">Network Details</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Framed IP</TableCell>
                  <TableCell>{accounting.framedIpAddress}</TableCell>
                  <TableCell className="font-medium">Rate Limit</TableCell>
                  <TableCell>{accounting.mikrotikRateLimit}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Called Station</TableCell>
                  <TableCell>{accounting.calledStationId}</TableCell>
                  <TableCell className="font-medium">Calling Station</TableCell>
                  <TableCell>{accounting.callingStationId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NAS IP</TableCell>
                  <TableCell>{accounting.nasIpAddress}</TableCell>
                  <TableCell className="font-medium">NAS Identifier</TableCell>
                  <TableCell>{accounting.nasIdentifier}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NAS Port</TableCell>
                  <TableCell>{accounting.nasPort}</TableCell>
                  <TableCell className="font-medium">NAS Port Type</TableCell>
                  <TableCell>{accounting.nasPortType}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Service Type</TableCell>
                  <TableCell>{accounting.serviceType}</TableCell>
                  <TableCell className="font-medium">Framed Protocol</TableCell>
                  <TableCell>{accounting.framedProtocol}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 