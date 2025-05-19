# GitHub Commit Strategy for PROMEDIATION

## 1. Branching Strategy

#### Main Branches:
- `main` - Production code
- `develop` - Integration branch for ongoing work

#### Feature Branches:
Create feature branches for new developments:

```powershell
# Create and switch to a new feature branch
git checkout -b feature/storage-page

# Or for bugfixes
git checkout -b bugfix/sidebar-navigation
```

## 2. Daily Workflow

Here's a PowerShell-friendly workflow:

```powershell
# 1. Start the day by pulling latest changes
git checkout develop
git pull origin develop

# 2. Create or switch to your feature branch
git checkout feature/your-feature
# OR create a new one
git checkout -b feature/your-feature

# 3. Work on your changes...

# 4. Stage specific files
git add src/components/layout/sidebar-nav.tsx

# 5. Or stage all changes
git add .

# 6. Commit with a descriptive message
git commit -m "Add Storage page to sidebar navigation"

# 7. Push to remote repository
git push origin feature/your-feature
```

## 3. Commit Message Guidelines

Structure your commit messages like:

```
<type>: <subject>

<body>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

Example:
```powershell
git commit -m "feat: add Storage page to sidebar navigation

Implement Storage page with file management functionality and integrate it into the main sidebar navigation."
```

## 4. Pull Request Process

When your feature is ready:
1. Push final changes:
   ```powershell
   git push origin feature/your-feature
   ```

2. Create a Pull Request on GitHub from `feature/your-feature` to `develop`

3. After code review and approval, merge into `develop`

## 5. Release Process

When ready for a release:

```powershell
# Create a release branch
git checkout -b release/v1.0.0 develop

# Make any final adjustments and version bumps

# Merge to main
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# Also merge back to develop
git checkout develop
git merge --no-ff release/v1.0.0

# Push everything
git push origin develop
git push origin main
git push origin --tags
```

## 6. Handle Merge Conflicts

If you encounter merge conflicts:

```powershell
# Pull changes that might conflict with yours
git pull origin develop

# If conflicts occur, resolve them in your editor
# After resolving...
git add .
git commit -m "Resolve merge conflicts"
git push origin feature/your-feature
```

## 7. PowerShell-Specific Scripts

You can create PowerShell scripts to simplify common operations:

```powershell
# Create a file named GitCommit.ps1
function Commit-Feature {
    param (
        [string]$message,
        [string]$description = ""
    )
    
    git add .
    
    if ($description -eq "") {
        git commit -m "$message"
    } else {
        git commit -m "$message" -m "$description"
    }
    
    git push
}

# Usage: .\GitCommit.ps1 Commit-Feature -message "feat: add storage page" -description "Detailed description here"
```

## 8. Git Aliases in PowerShell Profile

You can add Git aliases to your PowerShell profile:

```powershell
# Edit your profile: notepad $PROFILE
# Add these functions:

function gst { git status }
function gco { param($branch) git checkout $branch }
function gcb { param($branch) git checkout -b $branch }
function ga { git add . }
function gcm { param($msg) git commit -m $msg }
function gp { git push }
function gpl { git pull }
```
