const forgotPasswordTemplate = ({ name, otp } = {}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
  </head>
  <body>
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f4; padding: 20px"
    >
      <tr>
        <td align="center" style="padding-bottom: 20px">
          <img
            src="cid:logo"
            alt="Action Sports"
            style="width: 120px; height: auto"
          />
        </td>
      </tr>
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="background-color: #ffffff; border-radius: 8px; padding: 30px"
          >
            <tr>
              <td align="center">
                <h2 style="color: #333333; margin: 0 0 20px 0">
                  Hello ${name}!
                </h2>
              </td>
            </tr>
            <tr>
              <td align="center">
                <p
                  style="
                    color: #666666;
                    font-size: 16px;
                    line-height: 24px;
                    margin: 0 0 20px 0;
                  "
                >
                  Welcome to <strong>Action Sports</strong>!<br />
                  Use the following code to reset your password:
                </p>
              </td>
            </tr>
            <tr>
              <td align="center">
                <div
                  style="
                    background-color: #fcebeb; /* Lighter Red Background */
                    border: 2px solid #DE2628; /* Your Red Border */
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                  "
                >
                  <span
                    style="
                      font-size: 32px;
                      font-weight: bold;
                      color: #DE2628; /* Your Red Text */
                      letter-spacing: 8px;
                    "
                    >${otp}</span
                  >
                </div>
                </td>
            </tr>
            <tr>
              <td align="center">
                <p style="color: #999999; font-size: 13px; margin: 20px 0 0 0">
                  This code will expire in 10 minutes.<br />
                  If you didn't request this code, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export default forgotPasswordTemplate;
