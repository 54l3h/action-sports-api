const orderInvoiceTemplate = ({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  orderDate,
  paymentMethod,
  city,
  address,
  phone,
  items = [],
  subtotal,
  totalInstallation,
  shipping,
  grandTotal,
} = {}) => {
  const itemsRows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 14px 8px; text-align: center; color: #1e293b; font-size: 14px; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${index + 1}</td>
      <td style="padding: 14px 12px; text-align: center; color: #1e293b; font-size: 14px; font-weight: 500; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${item.name}</td>
      <td style="padding: 14px 8px; text-align: center; color: #1e293b; font-size: 14px; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${item.quantity}</td>
      <td style="padding: 14px 8px; text-align: center; color: #1e293b; font-size: 14px; white-space: nowrap; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${item.unitPrice} ر.س</td>
      <td style="padding: 14px 8px; text-align: center; color: #dc2626; font-weight: 600; font-size: 14px; white-space: nowrap; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${item.installationPrice} ر.س</td>
      <td style="padding: 14px 8px; text-align: center; color: #1e293b; font-weight: 600; font-size: 14px; white-space: nowrap; ${
        index === items.length - 1
          ? "border-bottom: none;"
          : "border-bottom: 1px solid #f1f5f9;"
      }">${item.total} ر.س</td>
    </tr>
  `
    )
    .join("");

  return `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Order Invoice</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
        
        * { 
            box-sizing: border-box; 
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 0;
            margin: 0;
            -webkit-font-smoothing: antialiased;
        }
        
        img {
            border: 0;
            max-width: 100%;
            height: auto;
            display: block;
        }
        
        table {
            border-collapse: collapse;
        }
        
        @media only screen and (max-width: 900px) {
            .wrapper {
                width: 100% !important;
            }
            
            .content-padding {
                padding: 25px 20px !important;
            }
            
            .header-padding {
                padding: 30px 20px !important;
            }
            
            .table-scroll {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }
            
            .info-card {
                padding: 0 6px !important;
            }
        }
        
        @media only screen and (max-width: 600px) {
            .main-title {
                font-size: 24px !important;
            }
            
            .section-title {
                font-size: 15px !important;
            }
            
            .text-size {
                font-size: 13px !important;
            }
            
            table td {
                font-size: 12px !important;
            }
            
            .info-card {
                padding: 0 4px !important;
            }
            
            .info-card table {
                font-size: 12px !important;
            }
            
            .info-card .section-title {
                font-size: 13px !important;
            }
            
            .info-card .text-size {
                font-size: 11px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #f8fafc; padding: 20px 10px;">
        <tr>
            <td align="center">
                <table width="950" cellpadding="0" cellspacing="0" border="0" role="presentation" class="wrapper" style="max-width: 950px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 0 auto;">
                    
                    <!-- Header with Logo and Invoice Title -->
                    <tr>
                        <td class="header-padding" style="padding: 35px 40px; background: #ffffff; border-radius: 12px 12px 0 0; border-bottom: 3px solid #dc2626;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                    <td width="50%" style="vertical-align: middle;">
                                        <img src="cid:logo" alt="Action Sports" width="120" style="width: 120px; max-width: 120px; height: auto; display: block;" />
                                        <div style="font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.5;">
                                            actionsportsatksa@gmail.com<br/>+966-555-000-111
                                        </div>
                                    </td>
                                    <td width="50%" align="right" style="vertical-align: middle;">
                                        <div class="main-title" style="font-size: 28px; font-weight: 800; color: #dc2626; margin-bottom: 8px;">
                                            فاتورة طلب
                                        </div>
                                        <div style="font-size: 14px; color: #64748b; background: #fef2f2; padding: 8px 16px; border-radius: 6px; display: inline-block; border: 1px solid #fecaca;">
                                            ${orderId}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 35px 40px;">
                            
                            <!-- Info Cards Grid -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" class="info-grid" style="margin-bottom: 30px;">
                                <tr>
                                    <!-- Customer Info -->
                                    <td width="32%" class="info-card" style="vertical-align: top; padding-right: 12px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; height: 100%;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <div class="section-title" style="font-size: 16px; font-weight: 700; color: #dc2626; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #fecaca;">
                                                        معلومات العميل
                                                    </div>
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">الاسم</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px;">${customerName}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">البريد الإلكتروني</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px; word-break: break-word;">${customerEmail}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">رقم الهاتف</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600;">${customerPhone}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    
                                    <!-- Order Details -->
                                    <td width="32%" class="info-card" style="vertical-align: top; padding: 0 12px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; height: 100%;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <div class="section-title" style="font-size: 16px; font-weight: 700; color: #dc2626; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #fecaca;">
                                                        تفاصيل الطلب
                                                    </div>
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">رقم الطلب</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px;">${orderId}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">التاريخ</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px;">${orderDate}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">طريقة الدفع</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600;">${paymentMethod}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    
                                    <!-- Shipping Address -->
                                    <td width="32%" class="info-card" style="vertical-align: top; padding-left: 12px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; height: 100%;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <div class="section-title" style="font-size: 16px; font-weight: 700; color: #dc2626; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #fecaca;">
                                                        عنوان الشحن
                                                    </div>
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">المدينة</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px;">${city}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">التفاصيل</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 12px;">${address}</div>
                                                    
                                                    <div class="text-size" style="font-size: 13px; color: #64748b; margin-bottom: 4px;">الهاتف</div>
                                                    <div class="text-size" style="font-size: 14px; color: #1e293b; font-weight: 600;">${phone}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Products Section -->
                            <div style="margin-bottom: 20px;">
                                <div class="section-title" style="font-size: 18px; font-weight: 700; color: #dc2626; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #fecaca;">
                                    المنتجات
                                </div>
                            </div>
                            
                            <!-- Products Table -->
                            <div class="table-scroll">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 25px; min-width: 650px;">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
                                            <th style="padding: 14px 8px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">#</th>
                                            <th style="padding: 14px 12px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">المنتج</th>
                                            <th style="padding: 14px 8px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">الكمية</th>
                                            <th style="padding: 14px 8px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">سعر الوحدة</th>
                                            <th style="padding: 14px 8px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">التركيب</th>
                                            <th style="padding: 14px 8px; text-align: center; color: #ffffff; font-weight: 700; font-size: 14px;">المجموع</th>
                                        </tr>
                                    </thead>
                                    <tbody style="background: #ffffff;">
                                        ${itemsRows}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Summary Section -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                    <td width="60%" style="vertical-align: top; padding-right: 20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
                                            <tr>
                                                <td>
                                                    <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">ملاحظات:</div>
                                                    <div style="font-size: 14px; color: #64748b; line-height: 1.6;">
                                                        شكراً لثقتكم بنا. نتطلع لخدمتكم مرة أخرى
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td width="40%" style="vertical-align: top;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border: 2px solid #fecaca; border-radius: 10px;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                                        <tr>
                                                            <td style="font-size: 14px; color: #64748b; padding: 6px 0;">المجموع الفرعي</td>
                                                            <td align="right" style="font-size: 15px; color: #1e293b; font-weight: 700; padding: 6px 0;">${subtotal} ر.س</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size: 14px; color: #dc2626; padding: 6px 0;">رسوم التركيب</td>
                                                            <td align="right" style="font-size: 15px; color: #dc2626; font-weight: 700; padding: 6px 0;">${totalInstallation} ر.س</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size: 14px; color: #64748b; padding: 6px 0;">الشحن</td>
                                                            <td align="right" style="font-size: 15px; color: #1e293b; font-weight: 700; padding: 6px 0;">${shipping} ر.س</td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" style="border-top: 2px dashed #fecaca; padding: 12px 0 8px;"></td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size: 16px; color: #dc2626; font-weight: 700; padding: 6px 0;">الإجمالي الكلي</td>
                                                            <td align="right" style="font-size: 20px; color: #dc2626; font-weight: 800; padding: 6px 0;">${grandTotal} ر.س</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 25px 40px; border-top: 1px solid #e2e8f0; background: #f8fafc; border-radius: 0 0 12px 12px;">
                            <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
                                شكراً لتعاملكم معنا
                            </div>
                            <div style="font-size: 14px; color: #64748b;">
                                Thank you for your business
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export default orderInvoiceTemplate;
