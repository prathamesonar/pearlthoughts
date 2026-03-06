import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Prescription } from "./prescriptionStore";

export async function exportPrescriptionPDF(
    prescription: Prescription,
    fileName: string = "prescription.pdf"
): Promise<void> {
    try {
        const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #06b6d4; padding-bottom: 15px;">
          <h1 style="margin: 0; color: #0891b2; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Medical Prescription</h1>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1;">
            <div style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Doctor Info</div>
            <div style="font-weight: bold; font-size: 16px;">Dr. ${prescription.doctorName}</div>
            <div style="color: #4b5563;">${prescription.specialty}</div>
          </div>
          <div style="flex: 1; text-align: right;">
            <div style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase;">Details</div>
            <div><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</div>
            <div><strong>Patient Email:</strong> ${prescription.patientEmail}</div>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Diagnosis</div>
          <div style="font-size: 15px;">${prescription.diagnosis}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Medications</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #cffafe; color: #164e63; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #06b6d4;">Medicine</th>
                <th style="padding: 10px; border-bottom: 2px solid #06b6d4;">Dosage</th>
                <th style="padding: 10px; border-bottom: 2px solid #06b6d4;">Frequency</th>
                <th style="padding: 10px; border-bottom: 2px solid #06b6d4;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medications
                .map(
                    (med, i) => `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${med.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${med.dosage}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${med.frequency}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${med.duration}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${prescription.notes
                ? `
        <div style="margin-top: 25px; margin-bottom: 20px;">
          <div style="color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Additional Notes</div>
          <div style="padding: 10px; border-left: 3px solid #06b6d4; background-color: #f8fafc;">${prescription.notes}</div>
        </div>
        `
                : ""
            }

        ${prescription.followUpDate
                ? `
        <div style="margin-top: 20px; font-weight: bold; color: #cf2a27;">
          Follow-up Appointment: ${new Date(prescription.followUpDate).toLocaleDateString()}
        </div>
        `
                : ""
            }
      </div>
    `;

        const element = document.createElement("div");
        element.innerHTML = html;
        element.style.position = "absolute";
        element.style.left = "-9999px";
        element.style.top = "-9999px";
        element.style.width = "800px";
        document.body.appendChild(element);

        const canvas = await html2canvas(element, { scale: 2 });
        document.body.removeChild(element);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}
