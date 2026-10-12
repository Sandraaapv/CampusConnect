package com.campusconnect.service;

import com.campusconnect.model.StudentRecord;
import com.campusconnect.model.StudentRequest;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfDocumentService {

    public byte[] generateApprovedRequestPdf(StudentRequest request, StudentRecord studentRecord) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            // Institution Header
            Paragraph header = new Paragraph("CAMPUSCONNECT INSTITUTE OF TECHNOLOGY", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("Office of the Dean (Student Affairs) & Registrar\nOFFICIAL APPROVAL CERTIFICATE\n\n", subHeaderFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(subHeader);

            // Certificate Details Box
            Table table = new Table(2);
            table.setWidth(100);
            table.setPadding(5);
            table.setBorderWidth(1);

            table.addCell(new Phrase("Certificate / Request ID:", boldFont));
            table.addCell(new Phrase(request.getId(), textFont));

            table.addCell(new Phrase("Application Type:", boldFont));
            table.addCell(new Phrase(request.getType(), textFont));

            table.addCell(new Phrase("Student Name:", boldFont));
            table.addCell(new Phrase(studentRecord.getName(), textFont));

            table.addCell(new Phrase("Register Number:", boldFont));
            table.addCell(new Phrase(studentRecord.getRegisterNumber(), textFont));

            table.addCell(new Phrase("Department:", boldFont));
            table.addCell(new Phrase(studentRecord.getDepartment(), textFont));

            table.addCell(new Phrase("Semester:", boldFont));
            table.addCell(new Phrase("Semester " + studentRecord.getSemester(), textFont));

            table.addCell(new Phrase("Submission Date:", boldFont));
            table.addCell(new Phrase(request.getSubmittedDate(), textFont));

            table.addCell(new Phrase("Official Clearance Status:", boldFont));
            table.addCell(new Phrase("APPROVED (Digitally Verified)", boldFont));

            document.add(table);
            document.add(new Paragraph("\n"));

            // Description / Purpose
            Paragraph desc = new Paragraph("Request Title & Purpose: " + request.getTitle(), titleFont);
            document.add(desc);

            Paragraph statement = new Paragraph(
                    "\nThis document certifies that the student named above has formally fulfilled all requisite criteria " +
                    "and clearances for the aforementioned application (" + request.getType() + "). " +
                    "Official administrative sanction has been granted according to institutional policies and college bylaws.\n\n",
                    textFont
            );
            document.add(statement);

            // Generate ZXing QR Code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    "https://campusconnect.institute/verify?token=" + request.getVerificationToken(),
                    BarcodeFormat.QR_CODE,
                    150,
                    150
            );
            ByteArrayOutputStream qrOut = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrOut);
            Image qrImage = Image.getInstance(qrOut.toByteArray());
            qrImage.setAlignment(Element.ALIGN_CENTER);
            document.add(qrImage);

            Paragraph verificationText = new Paragraph(
                    "Verification Token: " + request.getVerificationToken() + "\n" +
                    "Scan the QR code above to verify the digital authenticity of this credential.",
                    smallFont
            );
            verificationText.setAlignment(Element.ALIGN_CENTER);
            document.add(verificationText);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating approval certificate PDF: " + e.getMessage(), e);
        }
    }
}
