import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
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
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { tokens } from "../theme/tokens";
import { invoiceApi, type ClientInvoice } from "../services/invoiceApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { ClientKpiSkeleton } from "../components/common/ClientSkeleton";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    invoiceApi.getMyInvoices().then((data) => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  const handleViewInvoice = async (inv: ClientInvoice) => {
    setLoadingDetails(true);
    setSelectedInvoice(inv);
    try {
      const details = await invoiceApi.getInvoiceDetails(inv.id);
      if (details) {
        setSelectedInvoice(details);
      }
    } catch {
      // Keep existing invoice data
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Action</TableCell>
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
                    <TableCell sx={{ textAlign: "right" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                        onClick={() => handleViewInvoice(inv)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: `${tokens.borderRadius.sm}px`,
                          fontSize: "0.75rem",
                        }}
                      >
                        View & Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL INVOICE STATEMENT MODAL / PRINTABLE VIEW                         */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          id: "printable-invoice-modal",
          sx: {
            borderRadius: `${tokens.borderRadius.lg}px`,
            "@media print": {
              boxShadow: "none",
              margin: 0,
              maxWidth: "100%",
              width: "100%",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${tokens.colors.secondary[200]}`,
            "@media print": { display: "none" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Invoice Statement — {selectedInvoice?.invoiceNumber}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PrintOutlinedIcon />}
              onClick={handlePrint}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Print / Save PDF
            </Button>
            <Button onClick={() => setSelectedInvoice(null)} sx={{ textTransform: "none" }}>
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {loadingDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : selectedInvoice ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Printable Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Box
                    component="img"
                    src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
                    alt="Webliix Logo"
                    sx={{ height: 42, mb: 1, objectFit: "contain" }}
                  />
                  <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                    Webliix Technologies Pvt Ltd
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engineering, Web Applications & Digital Solutions
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Email: contact@webliix.com | Portal: login.webliix.com
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                  <Typography variant="h5" fontWeight={900} color={tokens.colors.primary.main} letterSpacing="0.05em">
                    TAX INVOICE
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color={tokens.colors.secondary[900]}>
                    #{selectedInvoice.invoiceNumber}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedInvoice.status}
                      color={
                        selectedInvoice.status === "PAID"
                          ? "success"
                          : selectedInvoice.status === "PARTIALLY_PAID"
                          ? "info"
                          : "warning"
                      }
                      sx={{ fontWeight: 800, textTransform: "uppercase" }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Billed To & Dates Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.md}px` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                    BILLED TO:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color={tokens.colors.secondary[900]}>
                    {selectedInvoice.customerCompanyName || selectedInvoice.customerName || "Valued Client"}
                  </Typography>
                  {selectedInvoice.customerName && selectedInvoice.customerCompanyName && (
                    <Typography variant="body2" color="text.secondary">
                      Attn: {selectedInvoice.customerName}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Project: <strong>{selectedInvoice.projectName || selectedInvoice.project?.projectName || "Custom Services"}</strong>
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.md}px`, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                    INVOICE PARTICULARS:
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Issue Date:</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString() : "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                    <Typography variant="body2" fontWeight={700} color={tokens.colors.warning[700]}>
                      {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : "Upon Receipt"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                    <Typography variant="body2" fontWeight={700} color={selectedInvoice.status === "PAID" ? tokens.colors.success[700] : tokens.colors.warning[700]}>
                      {selectedInvoice.status}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Itemized Table */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Deliverables & Services Breakdown
                </Typography>
                <TableContainer sx={{ border: `1px solid ${tokens.colors.secondary[200]}`, borderRadius: `${tokens.borderRadius.md}px` }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: tokens.colors.secondary[50] }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description / Deliverable</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Rate (₹)</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Amount (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>{item.itemName}</Typography>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: "right" }}>{item.quantity}</TableCell>
                            <TableCell sx={{ textAlign: "right" }}>₹{(item.unitPrice || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>
                              ₹{(item.totalPrice || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {selectedInvoice.projectName || "Software Development & Professional Services"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Contract deliverables & engineering hours
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: "right" }}>1</TableCell>
                          <TableCell sx={{ textAlign: "right" }}>₹{(selectedInvoice.totalAmount || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>₹{(selectedInvoice.totalAmount || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Financial Calculation Breakdown */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ width: { xs: "100%", sm: 340 }, p: 2, bgcolor: "#f8fafc", borderRadius: `${tokens.borderRadius.md}px`, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  {Boolean(selectedInvoice.taxAmount) && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Taxes (GST/VAT):</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{(selectedInvoice.taxAmount || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {Boolean(selectedInvoice.discountAmount) && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Discount Applied:</Typography>
                      <Typography variant="body2" fontWeight={600} color={tokens.colors.success[700]}>
                        -₹{(selectedInvoice.discountAmount || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" fontWeight={800}>Total Billed:</Typography>
                    <Typography variant="h6" fontWeight={800} color={tokens.colors.primary.main}>
                      ₹{(selectedInvoice.totalAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color={tokens.colors.success[700]} fontWeight={700}>Amount Paid:</Typography>
                    <Typography variant="body2" fontWeight={700} color={tokens.colors.success[700]}>
                      ₹{(selectedInvoice.paidAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 1, bgcolor: tokens.colors.warning[50], borderRadius: `${tokens.borderRadius.xs}px` }}>
                    <Typography variant="subtitle2" color={tokens.colors.warning[700]} fontWeight={800}>Balance Due:</Typography>
                    <Typography variant="subtitle2" fontWeight={800} color={tokens.colors.warning[700]}>
                      ₹{(selectedInvoice.pendingAmount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Notes & Bank Details */}
              <Box sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: `${tokens.borderRadius.md}px` }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  PAYMENT TERMS & INSTRUCTIONS
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedInvoice.notes || "Payments should be remitted via bank wire transfer or net banking per contract schedule. For support or payment confirmation, please contact your account manager or reach us at contact@webliix.com."}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, "@media print": { display: "none" } }}>
          <Button onClick={() => setSelectedInvoice(null)} sx={{ textTransform: "none" }}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Print / Save as PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
