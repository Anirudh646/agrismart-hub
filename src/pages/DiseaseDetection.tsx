import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle, Leaf, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Extract base64 data from data URL
      const base64Data = selectedImage.split(",")[1];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-crop-disease`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64Data }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your crop image has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Bug className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI Crop Disease Detection
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your crop leaves and our AI will analyze it for diseases, 
              provide treatment recommendations, and prevention tips.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upload Leaf Image
                </CardTitle>
                <CardDescription>
                  Take a clear photo of the affected leaf or plant part
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  capture="environment"
                />

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Selected crop"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Leaf className="w-4 h-4 mr-2" />
                            Analyze Disease
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Good Lighting</p>
                    <p className="text-sm text-muted-foreground">
                      Take photos in natural daylight for best results
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Close-up Shot</p>
                    <p className="text-sm text-muted-foreground">
                      Focus on the affected area of the leaf
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Clear Image</p>
                    <p className="text-sm text-muted-foreground">
                      Avoid blurry or shaky photos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI Guidance Only</p>
                    <p className="text-sm text-muted-foreground">
                      For serious issues, consult an agricultural expert
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Disease Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {analysis}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiseaseDetection;
