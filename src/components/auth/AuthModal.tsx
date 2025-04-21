import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openCreateLeagueModal: boolean;
  setOpenCreateLeagueModal: (open: boolean) => void;
}

const AuthModal = ({
  open,
  onOpenChange,
  openCreateLeagueModal,
  setOpenCreateLeagueModal,
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useContext(AuthContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (mode === "login") {
        const success = await login(values.email, values.password);
        if (success) {
          toast.success("Logged in successfully!");
          form.reset();
          setOpenCreateLeagueModal(true);
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        const success = await signup(values.email, values.password);
        if (success) {
          toast.success("User created successfully!");
          form.reset();
          setOpenCreateLeagueModal(true);
        } else {
          toast.error("Email already exists");
        }
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Sign In" : "Sign Up"}</DialogTitle>
          <Button
            variant="ghost"
            className="absolute right-2 top-2 text-gray-500 hover:bg-gray-100 p-1"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              <Button type="button" variant="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Create an account" : "Already have an account?"}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {mode === "login" ? "Login" : "Sign Up"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;