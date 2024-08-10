import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { moderateContent, getRemainingPosts, updateRemainingPosts, saveSocialMediaPost } from '../utils/socialMediaUtils';
import { useToast } from "@/components/ui/use-toast"

const Index = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [postsRemaining, setPostsRemaining] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRemainingPosts = async () => {
      const remaining = await getRemainingPosts('mockUserId');
      setPostsRemaining(remaining);
    };
    fetchRemainingPosts();
  }, []);

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (postsRemaining === 0) {
      toast({
        title: "Error",
        description: "You have no posts remaining for today.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    if (!content && !image && !video) {
      toast({
        title: "Error",
        description: "Please add some content to post.",
        variant: "destructive",
      });
      return;
    }

    if (!moderateContent(content, image, video)) {
      toast({
        title: "Content Moderation Failed",
        description: "Your content contains inappropriate material. Please revise and try again.",
        variant: "destructive",
      });
      return;
    }

    // Here you would implement the actual posting logic
    console.log('Posting to:', selectedPlatforms);
    console.log('Content:', content);
    console.log('Image:', image);
    console.log('Video:', video);

    // Save the post to the Moodle database
    await saveSocialMediaPost('mockUserId', selectedPlatforms, content, image, video);

    // Update posts remaining
    await updateRemainingPosts('mockUserId');
    setPostsRemaining(prev => prev - 1);

    toast({
      title: "Success",
      description: "Your content has been posted to the selected platforms.",
    });

    // Reset form
    setContent('');
    setImage(null);
    setVideo(null);
    setSelectedPlatforms([]);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Moodle Social Media Poster</h1>

        <div className="mb-4">
          <Label>Select Platforms:</Label>
          <div className="flex space-x-4 mt-2">
            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(platform => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox 
                  id={platform} 
                  checked={selectedPlatforms.includes(platform)}
                  onCheckedChange={() => handlePlatformChange(platform)}
                />
                <Label htmlFor={platform}>{platform}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="content">Content:</Label>
          <Textarea 
            id="content" 
            placeholder="What's on your mind?" 
            value={content}
            onChange={handleContentChange}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="image">Image:</Label>
          <div className="flex items-center mt-1">
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            {image && <ImageIcon className="ml-2" />}
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="video">Video:</Label>
          <div className="flex items-center mt-1">
            <Input id="video" type="file" accept="video/*" onChange={handleVideoChange} />
            {video && <VideoIcon className="ml-2" />}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={postsRemaining === 0}>
          Post to Social Media
        </Button>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Posts Remaining Today</AlertTitle>
          <AlertDescription>
            You have {postsRemaining} posts remaining for today.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Index;
