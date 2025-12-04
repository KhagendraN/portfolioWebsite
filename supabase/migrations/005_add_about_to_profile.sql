-- Add About section fields to profile table
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS about_image_url TEXT,
ADD COLUMN IF NOT EXISTS about_subtitle TEXT,
ADD COLUMN IF NOT EXISTS about_text TEXT;

-- Update existing profile with default values if they exist
UPDATE profile 
SET 
  about_image_url = COALESCE(about_image_url, 'assets/img/about.png'),
  about_subtitle = COALESCE(about_subtitle, 'I''m Khagendra Neupane'),
  about_text = COALESCE(about_text, 'I am a Bachelor of Engineering (Electronics, Communication & Information) student at Tribhuvan University, Pulchowk Campus, expected to graduate in 2028. I am passionate about networking, cybersecurity, and AI/ML, and enjoy bridging academic learning with practical applications. I am committed to contributing to open-source projects and fostering effective communication within my academic community.')
WHERE id IS NOT NULL;
