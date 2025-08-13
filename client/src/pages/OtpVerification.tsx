// sai-123-stack/pulse-work/pulse-work-3a60247e05301e6a63964fe9c09ab838577cff10/src/pages/OtpVerification.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

export const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Retrieve the activation token and email from the state passed during navigation
    const { activationToken, email } = location.state || {};

    if (!activationToken || !email) {
        // If the page is accessed directly without the required state, redirect to sign-up
        navigate('/auth');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/user/verify-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activationToken, otp }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }
           

            toast({
                title: "Account Verified!",
                description: "You can now sign in with your credentials.",
            });
            navigate('/auth'); // Redirect to login page after successful verification

        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="glass-card w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl gradient-text">Verify Your Account</CardTitle>
                    <CardDescription>
                        An OTP has been sent to <strong>{email}</strong>. Please enter it below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup className="mx-auto">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <Button type="submit" disabled={loading || otp.length < 6} className="w-full bg-gradient-primary">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};