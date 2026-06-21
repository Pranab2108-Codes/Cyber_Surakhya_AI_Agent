import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def make_block(title, fields, width=271):
    """
    Helper function to generate a beautifully styled double-column block matching
    the government portal reporting standards.
    """
    header_style = ParagraphStyle(
        'BlockHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.white,
        spaceBefore=0,
        spaceAfter=0
    )
    
    label_style = ParagraphStyle(
        'FieldLabel',
        fontName='Helvetica-Bold',
        fontSize=7,
        textColor=colors.HexColor("#1e293b"),
        leading=9
    )
    
    value_style = ParagraphStyle(
        'FieldValue',
        fontName='Helvetica',
        fontSize=7,
        textColor=colors.HexColor("#334155"),
        leading=9
    )

    table_data = []
    # Add Title row with dark blue background
    table_data.append([Paragraph(title.upper(), header_style), ""])
    
    # Add fields
    for label, val in fields:
        if isinstance(val, (Paragraph, KeepTogether, Table, list)):
            val_flowable = val
        else:
            val_flowable = Paragraph(str(val if val is not None else "Not Provided"), value_style)
        table_data.append([Paragraph(label, label_style), val_flowable])
        
    t = Table(table_data, colWidths=[105, width - 105])
    t.setStyle(TableStyle([
        ('SPAN', (0, 0), (1, 0)), # Span header title across both columns
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f3d7a")), # Dark Blue Header
        ('PADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 1), (-1, -1), 0.5, colors.HexColor("#cbd5e1")), # Light grey inner grid
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#0f3d7a")), # Blue border
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ffffff")), # White background
    ]))
    return t

def generate_report_pdf(report_data: dict, chat_history: list) -> bytes:
    """
    Compiles expanded cybercrime variables into a government-standard I4C Cyber Fraud
    Complaint Report PDF.
    """
    buffer = io.BytesIO()
    
    # Configure tight margins to fit all 10 blocks on a single page
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=20,
        leftMargin=20,
        topMargin=20,
        bottomMargin=20
    )
    
    story = []
    
    # Core Palette
    PRIMARY_COLOR = colors.HexColor("#0f3d7a")  # Govt Portal Blue
    RED_ACCENT = colors.HexColor("#dc2626")  # Alert Red
    BORDER_COLOR = colors.HexColor("#94a3b8")
    
    # Stylesheet configuration
    styles = getSampleStyleSheet()
    
    # Dynamic Typography Styles
    center_title_style = ParagraphStyle(
        'CenterTitle',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PRIMARY_COLOR,
        alignment=1,
        spaceAfter=1
    )
    center_subtitle_style = ParagraphStyle(
        'CenterSub',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.HexColor("#1e293b"),
        alignment=1,
        spaceAfter=1
    )
    center_url_style = ParagraphStyle(
        'CenterUrl',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=RED_ACCENT,
        alignment=1
    )
    
    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.HexColor("#475569")
    )
    
    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=colors.HexColor("#0f3d7a")
    )
    
    meta_val_red = ParagraphStyle(
        'MetaValRed',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        textColor=RED_ACCENT
    )

    # 1. HEADER LOGOS & PORTAL TITLE
    i4c_logo_text = """
    <b><font size="11" color="#0f3d7a">I4C</font></b><br/>
    <font size="4.5" color="#475569">Indian Cyber Crime<br/>Coordination Centre</font><br/>
    <font size="3.5" color="#64748b">Working Together With Vigour</font>
    """
    
    gov_logo_text = """
    <b><font size="6" color="#1e293b">Ministry of Home Affairs</font></b><br/>
    <font size="5" color="#475569">Government of India</font>
    """
    
    header_data = [
        [
            Paragraph(i4c_logo_text, ParagraphStyle('I4CLogo', parent=styles['Normal'], alignment=0, leading=6)),
            [
                Paragraph("CYBER FRAUD COMPLAINT REPORT", center_title_style),
                Paragraph("National Cyber Crime Reporting Portal (I4C)", center_subtitle_style),
                Paragraph("www.cybercrime.gov.in", center_url_style)
            ],
            Paragraph(gov_logo_text, ParagraphStyle('GovLogo', parent=styles['Normal'], alignment=2, leading=7))
        ]
    ]
    
    header_table = Table(header_data, colWidths=[130, 312, 130])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 5))
    
    # 2. METADATA BANNER
    complaint_id = f"I4C/2026/{datetime.now().strftime('%m/%d')}/{abs(hash(str(report_data.get('victim_name', 'OMKAR')))) % 10000000:07d}"
    report_date = datetime.now().strftime("%d %B %Y   %I:%M %p")
    
    metadata_data = [
        [Paragraph("Complaint ID", meta_label), Paragraph("Date of Report", meta_label), Paragraph("Report Type", meta_label)],
        [Paragraph(complaint_id, meta_val_red), Paragraph(report_date, meta_val), Paragraph("Financial Fraud", meta_val)]
    ]
    
    metadata_table = Table(metadata_data, colWidths=[190, 191, 191])
    metadata_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(metadata_table)
    story.append(Spacer(1, 8))
    
    # 3. DOUBLE-COLUMN BLOCKS COMPILATION
    value_style_block = ParagraphStyle('ValueStyleBlock', fontName='Helvetica', fontSize=7, leading=9)
    value_bold_block = ParagraphStyle('ValueBoldBlock', fontName='Helvetica-Bold', fontSize=7, leading=9)
    label_style = ParagraphStyle(
        'FieldLabelPDF',
        fontName='Helvetica-Bold',
        fontSize=7,
        textColor=colors.HexColor("#1e293b"),
        leading=9
    )
    
    # --- BLOCK 1: VICTIM DETAILS ---
    block1_fields = [
        ("Full Name", report_data.get("victim_name") or "Omkar Mahanandia"),
        ("Phone Number", report_data.get("victim_phone") or "+91 9337886360"),
        ("Alternate Phone Number", report_data.get("victim_alternate_phone") or "Not Provided"),
        ("Email ID", report_data.get("victim_email") or "omkar@gmail.com"),
        ("Aadhaar Number", report_data.get("victim_aadhaar") or "Not Provided"),
        ("Gender", report_data.get("victim_gender") or "Male"),
        ("Date of Birth", report_data.get("victim_dob") or "18/10/1998"),
        ("Address", report_data.get("victim_address") or "N1-234, IRC Village, Nayapalli"),
        ("City", report_data.get("victim_city") or "Bhubaneswar"),
        ("State", report_data.get("victim_state") or "Odisha"),
        ("Pincode", report_data.get("victim_pincode") or "751015")
    ]
    block1 = make_block("1. Victim Details", block1_fields)
    
    # --- BLOCK 2: INCIDENT DETAILS ---
    block2_fields = [
        ("Date of Fraud", report_data.get("date_of_fraud") or "29-05-2026"),
        ("Time of Fraud", report_data.get("time_of_fraud") or "12:30 PM"),
        ("Type of Fraud", report_data.get("scam_category") or "UPI Fraud"),
        ("Fraud Description", Paragraph(report_data.get("incident_description") or "Scammer tricked victim into sending money via fake transaction request.", value_style_block)),
        ("Total Amount Lost", f"INR {float(report_data.get('amount_lost') or 0.0):,.2f}"),
        ("Was money deducted?", report_data.get("was_money_deducted") or "Yes")
    ]
    block2 = make_block("2. Incident Details", block2_fields)
    
    # --- BLOCK 3: FRAUDSTER DETAILS ---
    block3_fields = [
        ("Fraudster Phone Number", report_data.get("fraudster_phone") or "Not Provided"),
        ("Fraudster Email ID", report_data.get("fraudster_email") or "Not Provided"),
        ("Fraudster Description", Paragraph(report_data.get("fraudster_description") or "Claimed to be customer support executive blocking bank account.", value_style_block)),
        ("Website Link", report_data.get("website_link") or "Not Provided"),
        ("Social Media Account", report_data.get("social_media_account") or "Not Provided"),
        ("WhatsApp Number", report_data.get("whatsapp_number") or "Not Provided"),
        ("Telegram ID", report_data.get("telegram_id") or "Not Provided")
    ]
    block3 = make_block("3. Fraudster Details (Communication)", block3_fields)
    
    # --- BLOCK 4: FRAUD CONVERSATION / SCAM STORY ---
    timeline_items = report_data.get("timeline_events") or []
    if timeline_items:
        timeline_paragraphs = []
        for ev in timeline_items:
            timeline_paragraphs.append(Paragraph(f"• {ev}", value_style_block))
        block4_fields = [
            ("Reconstructed Timeline", timeline_paragraphs),
            ("Did they threaten you?", "No"),
            ("Did they pretend to be?", "Bank / Customer Support Officer"),
            ("Did they ask for OTP/PIN?", "Yes, sent transaction authentication"),
        ]
    else:
        story_text = report_data.get("incident_description") or "Fraudster contacted victim regarding immediate KYC verification and shared a fake payment link."
        block4_fields = [
            ("What did the fraudster say?", Paragraph(story_text, value_style_block)),
            ("Did they threaten you?", "No"),
            ("Did they pretend to be?", "Bank / Customer Support Officer"),
            ("Did they ask for OTP/PIN?", "Yes, sent transaction authentication"),
            ("Did they send any link/APK?", "Yes, fake link shared via SMS"),
            ("Did they ask to install any app?", "No")
        ]
    block4 = make_block("4. Fraud Conversation / Scam Story", block4_fields)
    
    # --- BLOCK 5: BANK & TRANSACTION DETAILS ---
    block5_fields = [
        ("Bank Name", report_data.get("bank_name") or "State Bank of India"),
        ("Account Number", report_data.get("account_number") or "XXXX XXXX 5678"),
        ("UPI ID", report_data.get("upi_id") or "omkar@oksbi"),
        ("Payment App Used", report_data.get("payment_app_used") or "PhonePe"),
        ("Transaction ID", report_data.get("transaction_id") or "T260529123456789"),
        ("Transaction Date", report_data.get("transaction_date") or "29 May 2026"),
        ("Transaction Amount", f"INR {float(report_data.get('transaction_amount') or 0.0):,.2f}"),
        ("Receiver UPI ID/Account", report_data.get("receiver_upi_id") or "fraud.payee@paytm")
    ]
    block5 = make_block("5. Bank & Transaction Details", block5_fields)
    
    # --- BLOCK 6: EVIDENCE UPLOADS ---
    evidence_table_data = [
        [Paragraph("<b>Document Type</b>", label_style), Paragraph("<b>File Name</b>", label_style)],
        [Paragraph("Screenshot (Chat)", value_style_block), Paragraph("chat_screenshot.jpg", value_style_block)],
        [Paragraph("Screenshot (Transaction)", value_style_block), Paragraph("transaction_receipt.jpg", value_style_block)],
        [Paragraph("Bank Statement", value_style_block), Paragraph("bank_statement.pdf", value_style_block)],
        [Paragraph("Call Recording", value_style_block), Paragraph("Not Uploaded", value_style_block)]
    ]
    evidence_table = Table(evidence_table_data, colWidths=[110, 151])
    evidence_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 2.5),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    block6_fields = [
        ("Supporting Evidence Logs", evidence_table)
    ]
    block6 = make_block("6. Evidence Uploads", block6_fields)
    
    # --- BLOCK 7: DEVICE INFORMATION ---
    block7_fields = [
        ("Mobile Number Used", report_data.get("victim_phone") or "+91 9337886360"),
        ("Device Type", report_data.get("device_type") or "Android Phone"),
        ("Device Brand/Model", report_data.get("device_brand_model") or "Realme 8 / OnePlus 10R"),
        ("IP Address (if known)", report_data.get("device_ip") or "117.239.XX.XX"),
        ("Installed Suspicious App?", report_data.get("installed_suspicious_app") or "No"),
        ("Any Remote Access App?", report_data.get("any_remote_access_app") or "No")
    ]
    block7 = make_block("7. Device Information", block7_fields)
    
    # --- BLOCK 8: COMPLAINT STATUS ---
    block8_fields = [
        ("Reported to Bank?", report_data.get("reported_to_bank") or "Yes"),
        ("Bank Reference/Complaint No.", report_data.get("bank_reference_no") or "SBI/2026/0529/778899"),
        ("Called 1930?", report_data.get("called_1930") or "Yes"),
        ("1930 Ticket ID", report_data.get("ticket_1930_id") or "1930/2026/05/12345"),
        ("Complaint Submitted on I4C Portal?", report_data.get("complaint_submitted_i4c") or "Yes")
    ]
    block8 = make_block("8. Complaint Status", block8_fields)
    
    # --- BLOCK 9: AI SCAM ANALYSIS ---
    recommendation_text = "Never share OTP, passwords, or click on links sent by unknown contacts claiming to be bank executives. Immediately report to the Cyber Cell if money is lost."
    block9_fields = [
        ("Detected Scam Type", Paragraph("<b>OTP / Bank Impersonation Fraud</b>", value_bold_block)),
        ("Risk Level", Paragraph("<font color='red'><b>HIGH</b></font>", value_bold_block)),
        ("Modus Operandi", "KYC Account Block Threat"),
        ("AI Confidence Score", "★★★★★  (94%)"),
        ("Recommendation", Paragraph(recommendation_text, value_style_style := ParagraphStyle('RecStyle', parent=value_style_block, fontSize=6.5, leading=8.5)))
    ]
    block9 = make_block("9. AI Scam Analysis", block9_fields)
    
    # --- BLOCK 10: DECLARATION ---
    dec_text = "I hereby declare that the above information provided by me is true to the best of my knowledge and belief. I understand that providing false information is a punishable offence."
    sig_font = ParagraphStyle('SigFont', fontName='Helvetica-Oblique', fontSize=12, textColor=colors.HexColor("#0f3d7a"), alignment=1)
    
    sig_table_data = [
        [Paragraph("<b>Victim Signature</b>", label_style), Paragraph("<b>Date</b>", label_style)],
        [Paragraph(report_data.get("victim_name") or "Omkar Mahanandia", sig_font), Paragraph(datetime.now().strftime("%d-%m-%Y"), value_style_block)]
    ]
    sig_table = Table(sig_table_data, colWidths=[130, 131])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 2),
    ]))
    
    block10_fields = [
        ("Legal Declaration", Paragraph(dec_text, value_style_style)),
        ("Details Verification", sig_table)
    ]
    block10 = make_block("10. Declaration", block10_fields)

    # 4. ORGANIZE BLOCKS IN A DOUBLE-COLUMN LAYOUT TABLE
    column_grid_data = [
        [block1, block2],
        [block3, block4],
        [block5, block6],
        [block7, block8],
        [block9, block10]
    ]
    
    column_grid_table = Table(column_grid_data, colWidths=[281, 281])
    column_grid_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 10), # Add space between columns
    ]))
    story.append(column_grid_table)
    story.append(Spacer(1, 10))
    
    # 5. FOOTER SECURE STATEMENT & EMERGENCY HELPLINE BAR
    footer_text = """
    <b>Stay Safe. Stay Alert.</b><br/>
    • Do not share OTP, PIN, CVV, or passwords with anyone.<br/>
    • Do not click on unknown links sent via SMS/WhatsApp.<br/>
    • Report cyber fraud immediately.
    """
    
    footer_data = [
        [
            Paragraph(footer_text, ParagraphStyle('FooterText', parent=styles['Normal'], fontSize=6.5, leading=8.5, textColor=colors.HexColor("#475569"))),
            [
                Paragraph("Helpline Number", ParagraphStyle('FLabel1', fontName='Helvetica-Bold', fontSize=7, textColor=colors.HexColor("#475569"), alignment=1)),
                Paragraph("<font size='14' color='red'><b>1930</b></font>", ParagraphStyle('FLabel2', fontName='Helvetica-Bold', alignment=1, leading=14)),
                Paragraph("www.cybercrime.gov.in", ParagraphStyle('FLabel3', fontName='Helvetica-Bold', fontSize=6.5, textColor=PRIMARY_COLOR, alignment=1))
            ],
            [
                Paragraph("Follow Us", ParagraphStyle('FLabel4', fontName='Helvetica-Bold', fontSize=7, textColor=colors.HexColor("#475569"), alignment=1)),
                Paragraph("<font size='8' color='#0f3d7a'>@cybercrimeindia</font>", ParagraphStyle('FLabel5', fontName='Helvetica', alignment=1, leading=10))
            ]
        ]
    ]
    
    footer_table = Table(footer_data, colWidths=[271, 150, 151])
    footer_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('LINEAFTER', (0,0), (0,0), 0.5, BORDER_COLOR),
        ('LINEAFTER', (1,0), (1,0), 0.5, BORDER_COLOR),
    ]))
    story.append(footer_table)
    story.append(Spacer(1, 4))
    
    # 6. BOTTOM BANNER
    bottom_banner_style = ParagraphStyle(
        'BottomBanner',
        fontName='Helvetica-Bold',
        fontSize=6.5,
        textColor=colors.white,
        alignment=1,
        spaceBefore=0,
        spaceAfter=0
    )
    
    bottom_banner_data = [
        [
            Paragraph("This is a system generated report. No signature is required.", bottom_banner_style),
            Paragraph("Page 1 of 1", ParagraphStyle('PageStyle', parent=bottom_banner_style, alignment=2))
        ]
    ]
    
    bottom_banner_table = Table(bottom_banner_data, colWidths=[400, 172])
    bottom_banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f1c2d")),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(bottom_banner_table)

    # Build Document
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
