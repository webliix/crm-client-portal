import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import { tokens } from "../theme/tokens";
import { invoiceApi, type ClientInvoice } from "../services/invoiceApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { ClientKpiSkeleton } from "../components/common/ClientSkeleton";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceApi.getMyInvoices().then((data) => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  const totalBilling = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalPending = invoices.reduce((sum, i) => sum + (i.pendingAmount || 0), 0);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
          Invoices & Billing Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track payments, pending invoice balances, and official billing statements.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
        {loading ? (
          <>
            <ClientKpiSkeleton />
            <ClientKpiSkeleton />
            <ClientKpiSkeleton />
          </>
        ) : (
          <>
            <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary.main }}>
                  <AccountBalanceWalletOutlinedIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Total Billed
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
                    ₹{totalBilling.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.success[50], color: tokens.colors.success.main }}>
                  <CheckCircleOutlinedIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Total Paid
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={tokens.colors.success[700]}>
                    ₹{totalPaid.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.warning[50], color: tokens.colors.warning.main }}>
                  <HourglassTopOutlinedIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Pending Balance
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={tokens.colors.warning[700]}>
                    ₹{totalPending.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Invoice Table */}
      {loading ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <BrandLoader message="Loading invoices & financial records..." size="medium" />
        </Box>
      ) : invoices.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 56, color: tokens.colors.secondary[300], mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[800]} gutterBottom>
            No Invoices Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You currently have no billed invoices on record.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: tokens.borderRadius.lg, overflow: "hidden", border: `1px solid ${tokens.colors.secondary[200]}`, boxShadow: tokens.shadows.sm }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: tokens.colors.secondary[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Project / Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Billed</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pending Due</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary.main }}>
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {inv.projectName || inv.project?.projectName || "Webliix Software Services"}
                    </TableCell>
                    <TableCell>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ color: tokens.colors.success[700], fontWeight: 600 }}>
                      ₹{(inv.paidAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: (inv.pendingAmount || 0) > 0 ? tokens.colors.warning[700] : "text.secondary", fontWeight: 600 }}>
                      ₹{(inv.pendingAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status || "PAID"}
                        color={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "PARTIALLY_PAID"
                            ? "info"
                            : inv.status === "OVERDUE"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
