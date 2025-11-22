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
  shipping,
  grandTotal,
} = {}) => {
  const itemsRows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 12px 16px; text-align: center; color: #223047; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${
        index + 1
      }</td>
      <td style="padding: 12px 16px; text-align: right; color: #223047; font-size: 15px; border-bottom: 1px solid #e5e7eb;">${
        item.name
      }</td>
      <td style="padding: 12px 16px; text-align: center; color: #223047; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${
        item.quantity
      }</td>
      <td style="padding: 12px 16px; text-align: center; color: #223047; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${
        item.unitPrice
      } ر.س</td>
      <td style="padding: 12px 16px; text-align: center; color: #223047; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${
        item.total
      } ر.س</td>
    </tr>
  `
    )
    .join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>فاتورة طلب</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        
        * { 
            box-sizing: border-box; 
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
            background: #f7f8fb;
            color: #223047;
            direction: rtl;
            padding: 0;
            margin: 0;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8fb; direction: rtl;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f8fb; padding: 40px 20px;" dir="rtl">
        <tr>
            <td align="center">
                <!-- Main Invoice Container -->
                <table width="700" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 18px 45px rgba(34,48,71,0.08); border: 1px solid #f0f1f5; overflow: hidden;" dir="rtl">
                    
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding: 32px 40px 24px 40px; background: #ffffff;">
                            <img src="cid:logo" alt="Action Sports" style="width: 140px; height: auto; display: block; margin: 0 auto;" />
                        </td>
                    </tr>
                    
                    <!-- Header with Title -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px; border-bottom: 4px solid #f6f7fb;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                                <tr>
                                    <td style="text-align: center;">
                                        <div style="font-size: 16px; color: #a0a7b1; margin-bottom: 8px;">
                                            Action Sports
                                        </div>
                                        <div style="font-size: 13px; color: #a0a7b1; margin-bottom: 20px;">
                                            actionsportsatksa@gmail.com | +966-555-000-111
                                        </div>
                                        <div style="font-size: 32px; font-weight: 700; color: #d32f2f; letter-spacing: 1px; margin-bottom: 8px;">
                                            فاتورة طلب
                                        </div>
                                        <div style="font-size: 15px; color: #a0a7b1;">
                                            ${orderId}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            
                            <!-- Customer Info Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fafbff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;">
                                <tr>
                                    <td style="font-size: 18px; font-weight: 600; color: #d32f2f; padding-bottom: 16px; text-align: right;">
                                        معلومات العميل
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">الاسم</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${customerName}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">البريد الإلكتروني</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500; word-break: break-word;">${customerEmail}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">رقم الهاتف</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${customerPhone}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Order Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fafbff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;">
                                <tr>
                                    <td style="font-size: 18px; font-weight: 600; color: #d32f2f; padding-bottom: 16px; text-align: right;">
                                        تفاصيل الطلب
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">رقم الطلب</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${orderId}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">التاريخ</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${orderDate}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">طريقة الدفع</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${paymentMethod}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Shipping Address Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fafbff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
                                <tr>
                                    <td style="font-size: 18px; font-weight: 600; color: #d32f2f; padding-bottom: 16px; text-align: right;">
                                        عنوان الشحن
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">المدينة</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${city}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">التفاصيل</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${address}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 15px; color: #a0a7b1; text-align: right; width: 35%; white-space: nowrap;">الهاتف</td>
                                                <td style="font-size: 15px; color: #223047; text-align: left; font-weight: 500;">${phone}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Products Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;" dir="rtl">
                                <thead>
                                    <tr style="background: #fbeaec;">
                                        <th style="padding: 14px 12px; text-align: center; color: #d32f2f; font-weight: 600; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; width: 8%;">#</th>
                                        <th style="padding: 14px 16px; text-align: right; color: #d32f2f; font-weight: 600; font-size: 15px; border-bottom: 1px solid #e5e7eb; width: 40%;">المنتج</th>
                                        <th style="padding: 14px 12px; text-align: center; color: #d32f2f; font-weight: 600; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; width: 13%;">الكمية</th>
                                        <th style="padding: 14px 12px; text-align: center; color: #d32f2f; font-weight: 600; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; width: 20%;">سعر الوحدة</th>
                                        <th style="padding: 14px 12px; text-align: center; color: #d32f2f; font-weight: 600; font-size: 15px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; width: 19%;">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsRows}
                                </tbody>
                            </table>
                            
                            <!-- Summary Card -->
                            <table cellpadding="0" cellspacing="0" border="0" style="background: #fff9f9; border: 2px solid #f1c0c0; border-radius: 12px; padding: 24px 28px; width: 100%;" dir="rtl">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 16px; color: #223047; text-align: right; white-space: nowrap;">إجمالي المنتجات</td>
                                                <td style="font-size: 16px; color: #223047; text-align: left; font-weight: 600; white-space: nowrap;">${subtotal} ر.س</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 16px; color: #223047; text-align: right; white-space: nowrap;">الشحن</td>
                                                <td style="font-size: 16px; color: #223047; text-align: left; font-weight: 600; white-space: nowrap;">${shipping} ر.س</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0 0 0; border-top: 2px dashed #f1c0c0;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="font-size: 20px; color: #d32f2f; text-align: right; font-weight: 700; white-space: nowrap;">الإجمالي الكلي</td>
                                                <td style="font-size: 20px; color: #d32f2f; text-align: left; font-weight: 700; white-space: nowrap;">${grandTotal} ر.س</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 28px 40px 36px; border-top: 1px solid #f2f4f7; background: #fafbff; text-align: center;">
                            <div style="font-size: 17px; font-weight: 700; color: #223047; padding-bottom: 10px;">
                                شكراً لتعاملكم معنا
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
