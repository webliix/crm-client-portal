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
              {/* ========================================================= */}
              {/* EXACT WEBLIIX OFFICIAL INVOICE TEMPLATE (PDF MATCH)        */}
              {/* ========================================================= */}
              {/* Header: Logo and Invoice Date */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pb: 1.5, borderBottom: "2px solid #0f172a" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="img"
                    src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
                    alt="Webliix Logo"
                    sx={{ height: 38, objectFit: "contain" }}
                  />
                  <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.5px", color: "#0f172a" }}>
                    webliix
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={800} color="#0f172a">
                    DATE: {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
                  </Typography>
                </Box>
              </Box>

              {/* Invoice Title */}
              <Box sx={{ textAlign: "center", my: 1 }}>
                <Typography variant="h4" fontWeight={900} letterSpacing="0.05em" sx={{ color: "#0f172a" }}>
                  INVOICE #{selectedInvoice.invoiceNumber || "0154"}
                </Typography>
              </Box>

              {/* Bill to / Ship to Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, border: "1px solid #cbd5e1", borderRadius: 1.5, p: 2, bgcolor: "#f8fafc" }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a" sx={{ borderBottom: "1px solid #cbd5e1", pb: 0.5, mb: 1 }}>
                    Bill to:
                  </Typography>
                  <Typography variant="body2"><strong>Client / Company:</strong> {selectedInvoice.customerCompanyName || selectedInvoice.customerName || "Webliix Client"}</Typography>
                  <Typography variant="body2"><strong>Contact Person:</strong> {selectedInvoice.customerName || selectedInvoice.customerCompanyName || "Authorized Signatory"}</Typography>
                  <Typography variant="body2"><strong>Client ID#:</strong> #{selectedInvoice.customerId || selectedInvoice.id}</Typography>
                  <Typography variant="body2"><strong>Project:</strong> {selectedInvoice.projectName || selectedInvoice.project?.projectName || "Engineering Services"}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a" sx={{ borderBottom: "1px solid #cbd5e1", pb: 0.5, mb: 1 }}>
                    Ship to:
                  </Typography>
                  <Typography variant="body2"><strong>Recipient:</strong> {selectedInvoice.customerCompanyName || selectedInvoice.customerName || "Webliix Client"}</Typography>
                  <Typography variant="body2"><strong>Delivery:</strong> Digital Delivery / Remote Deployment</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {selectedInvoice.status || "DRAFT"}</Typography>
                  <Typography variant="body2"><strong>Portal:</strong> login.webliix.com</Typography>
                </Box>
              </Box>

              {/* Sub-grid: Payment Due, Salesperson, Terms, Status */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.5, border: "1px solid #cbd5e1", borderRadius: 1, p: 1.5, bgcolor: "#f1f5f9", textAlign: "center" }}>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">PAYMENT DUE</Typography>
                  <Typography variant="body2" fontWeight={800}>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString("en-GB") : "Upon Receipt"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">SALESPERSON / LEAD</Typography>
                  <Typography variant="body2" fontWeight={800}>Webliix Direct</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">PAYMENT TERMS</Typography>
                  <Typography variant="body2" fontWeight={800}>Contractual Schedule</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">PAYMENT STATE</Typography>
                  <Typography variant="body2" fontWeight={800} color={selectedInvoice.status === "PAID" ? "success.main" : "warning.main"}>
                    Paid: ₹{(selectedInvoice.paidAmount || 0).toLocaleString()}/-
                  </Typography>
                </Box>
              </Box>

              {/* Itemized Table */}
              <TableContainer sx={{ border: "1px solid #cbd5e1", borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#0f172a" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Qty.</TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Item#</TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800 }}>Description</TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800, textAlign: "right" }}>Unit price</TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800, textAlign: "right" }}>Discount</TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: 800, textAlign: "right" }}>Line total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <TableRow key={idx} sx={{ "&:nth-of-type(even)": { bgcolor: "#f8fafc" } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{item.quantity || 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>{item.itemName}</Typography>
                            {item.description && <Typography variant="caption" color="text.secondary">{item.description}</Typography>}
                          </TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>₹{(item.unitPrice || 0).toLocaleString()}/-</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>₹0/-</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 800 }}>₹{(item.totalPrice || (item.quantity * item.unitPrice) || 0).toLocaleString()}/-</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>1</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>01</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {selectedInvoice.projectName || "Software Development & Architecture Services"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Delivery milestones, cloud deployment & engineering sprint
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>₹{(selectedInvoice.totalAmount || 0).toLocaleString()}/-</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>₹{(selectedInvoice.discountAmount || 0).toLocaleString()}/-</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 800 }}>₹{(selectedInvoice.totalAmount || 0).toLocaleString()}/-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Financial Totals Block */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ width: { xs: "100%", sm: 380 }, border: "1px solid #cbd5e1", borderRadius: 1.5, p: 2, bgcolor: "#f8fafc", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Discount:</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{(selectedInvoice.discountAmount || 0).toLocaleString()}/-</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Subtotal:</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0).toLocaleString()}/-</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="success.main" fontWeight={700}>Paid Amount:</Typography>
                    <Typography variant="body2" fontWeight={800} color="success.main">₹{(selectedInvoice.paidAmount || 0).toLocaleString()}/-</Typography>
                  </Box>
                  
                  {/* Status: Remaining Payment Pill Bar */}
                  <Box sx={{ p: 1.25, bgcolor: (selectedInvoice.pendingAmount || 0) > 0 ? "#fef3c7" : "#dcfce7", borderRadius: 1, border: `1px solid ${(selectedInvoice.pendingAmount || 0) > 0 ? "#f59e0b" : "#16a34a"}`, textAlign: "center" }}>
                    <Typography variant="subtitle2" fontWeight={900} color={(selectedInvoice.pendingAmount || 0) > 0 ? "#b45309" : "#15803d"}>
                      Status: Remaining Payment of ₹{(selectedInvoice.pendingAmount ?? ((selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0))).toLocaleString()}/-
                    </Typography>
                  </Box>

                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight={900}>Total:</Typography>
                    <Typography variant="h5" fontWeight={900} color="primary.main">
                      ₹{(selectedInvoice.totalAmount || 0).toLocaleString()}/-
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Official Thank you & Authorized Signatory */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ fontStyle: "italic", color: "#0f172a" }}>
                    Thank you for your business!
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    For billing support or payment confirmation: contact@webliix.com | +91 93101 81569
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body1" sx={{ fontFamily: "cursive", fontStyle: "italic", fontWeight: 700, color: "#1e293b", minHeight: 28 }}>
                    Himanshu Sharma
                  </Typography>
                  <Box sx={{ width: 140, height: 1, bgcolor: "#334155", my: 0.5, mx: "auto" }} />
                  <Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: "block" }}>
                    Authorized Signatory
                  </Typography>
                </Box>
              </Box>

              {/* Official Footer */}
              <Box sx={{ textAlign: "center", pt: 1, borderTop: "2px solid #0f172a" }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ display: "block" }}>
                  B-34, Galaxy Blue Sapphire Plaza, Greater Noida West Sector 4, Uttar Pradesh 201305 | contact@webliix.com | +91 93101 81569 | webliix.com
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
