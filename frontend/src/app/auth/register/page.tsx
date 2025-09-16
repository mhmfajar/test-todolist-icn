import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <Card className="p-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
