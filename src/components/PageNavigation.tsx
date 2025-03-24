
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PageNavigationProps {
  className?: string;
}

const PageNavigation = ({ className = "" }: PageNavigationProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goBack}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goForward}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Forward</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PageNavigation;
