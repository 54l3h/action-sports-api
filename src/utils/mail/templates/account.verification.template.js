const accountVerificationTemplate = ({ name, otp } = {}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Account</title>
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
                  Welcome ${name}!
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
                  Thank you for signing up with <strong>Action Sports</strong>!<br />
                  Please verify your account using the code below:
                </p>
              </td>
            </tr>
            <tr>
              <td align="center">
                <div
                  style="
                    background-color: #fcebeb;
                    border: 2px solid #DE2628;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                  "
                >
                  <span
                    style="
                      font-size: 32px;
                      font-weight: bold;
                      color: #DE2628;
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
                  This verification code will expire in 10 minutes.<br />
                  If you didn't create an account, please ignore this email.
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

export default accountVerificationTemplate;
