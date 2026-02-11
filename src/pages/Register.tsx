import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MiCasaLogo } from '@/components/branding/MiCasaLogo';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('Broker');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created',
        description: 'You can now sign in to the system',
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Panel - Branding (Desktop only) */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-muted to-card" />
        
        {/* Decorative Glows */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl bg-primary/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div variants={logoVariants}>
            <MiCasaLogo useImage width={220} />
          </motion.div>
        </div>

        <motion.div className="relative z-10 space-y-8" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
              Request System <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Access
              </span>
            </h2>
            <p className="text-muted-foreground max-w-md text-lg">
              Create your account to access the Brokerage Operating System. 
              Broker accounts require ICA verification before activation.
            </p>
          </motion.div>

          <motion.div 
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm"
            variants={itemVariants}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500 text-sm">Account Provisioning</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All accounts are subject to verification. Broker accounts remain in 
                  "Pending" status until ICA documentation is executed and verified.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground"
          variants={itemVariants}
        >
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span>Secure Registration • All Actions Logged</span>
        </motion.div>
      </motion.div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        
        {/* Mobile decorative glow */}
        <motion.div 
          className="absolute top-10 right-10 w-48 h-48 rounded-full blur-3xl bg-primary/10 lg:hidden"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          className="w-full max-w-md relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden flex justify-center mb-8"
            variants={logoVariants}
          >
            <MiCasaLogo useImage width={180} />
          </motion.div>

          {/* Glass Card */}
          <motion.div 
            className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl"
            variants={itemVariants}
          >
            <motion.div className="text-center lg:text-left mb-6" variants={itemVariants}>
              <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
              <p className="text-muted-foreground mt-2">
                Request access to the brokerage system
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="fullName" className="text-foreground/80">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                />
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                />
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="role" className="text-foreground/80">Requested Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Manager">Manager (Admin)</SelectItem>
                    <SelectItem value="Owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Role assignment requires verification by a Manager
                </p>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-12 bg-background/50 border-border/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted/50 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 btn-gold font-medium relative overflow-hidden group"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            </form>

            <motion.div className="text-center text-sm mt-6" variants={itemVariants}>
              <span className="text-muted-foreground">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
