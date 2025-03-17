import { CalendarRange } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-20 md:flex-row md:py-0">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CourseAgenda. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;