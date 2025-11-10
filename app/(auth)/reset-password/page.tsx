export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div>
      <h1>Reset Password</h1>
      <p>Token: {token}</p>
    </div>
  );
}