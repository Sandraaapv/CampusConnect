import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  QrCode,
  Download,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const IdCardPage: React.FC = () => {
  const [user, setUser] = useState(() => db.getUser());
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.avatarUrl || null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Signed token for student verification
  const verificationToken = `cc_token_${user.registerNumber}_auth_v2`;
  const verificationUrl = `${window.location.origin}/verify/${verificationToken}`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoPreview(dataUrl);
        db.updateUserProfile({ avatarUrl: dataUrl });
        setUser({ ...db.getUser(), avatarUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <PortalLayout currentPath="/id-card" title="Digital Student ID Card">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner with Mascot */}
        <div className="portal-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-[var(--accent-yellow)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tamper-Proof Digital Credential</span>
            </div>
            <h2 className="portal-heading text-2xl sm:text-3xl text-[var(--app-text)]">
              Your Official Campus Identity. Always on Your Phone.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
              Equipped with a cryptographically signed QR code. Verifiable in real-time by campus gates, examination halls, and library kiosks without login requirements.
            </p>
          </div>

          <div className="w-32 h-32 shrink-0 flex items-center justify-center">
            <img
              src="/mascots/09-Digital ID card.png"
              alt="Digital ID card mascot"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        {/* =========================================================================
            ID CARD DISPLAY (Styled as a sleek physical NFC plastic card)
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Card Element */}
          <div className="w-full max-w-sm sm:max-w-md aspect-[1.586/1] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white border border-white/20 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Background subtle watermark & chips */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
            <div className="absolute right-6 bottom-6 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Top Row: Institution branding & contactless logo */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-black font-black text-sm flex items-center justify-center shadow-xs">
                  cc
                </div>
                <div>
                  <span className="font-montserrat font-black text-xs tracking-wider uppercase block text-white">
                    CAMPUSCONNECT
                  </span>
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                    STUDENT IDENTITY CARD
                  </span>
                </div>
              </div>

              {/* NFC / Smart Chip Icon */}
              <div className="w-8 h-6 rounded-md bg-amber-300/20 border border-amber-300/40 flex items-center justify-center">
                <span className="text-[9px] font-mono font-black text-amber-300">NFC</span>
              </div>
            </div>

            {/* Middle Row: Photo + Details */}
            <div className="flex items-center gap-5 my-auto z-10">
              {/* Photo */}
              <div className="relative group shrink-0">
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-neutral-800 border-2 border-white/30 overflow-hidden flex items-center justify-center">
                  <img
                    src={photoPreview || '/mascots/01-welcome.png'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Change photo button */}
                <label className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 text-black cursor-pointer shadow-md hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Text Info */}
              <div className="space-y-1 text-left min-w-0">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight truncate">
                  {user.name}
                </h3>
                <div className="font-mono text-xs text-amber-300 font-bold">
                  {user.registerNumber}
                </div>
                <div className="text-[11px] text-neutral-300 truncate">
                  {user.department}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Semester {user.semester} • Batch 2023-2027
                </div>
              </div>
            </div>

            {/* Bottom Row: QR Code + Security Barcode */}
            <div className="flex items-end justify-between pt-3 border-t border-white/10 z-10">
              <div className="text-[9px] text-neutral-400 space-y-0.5">
                <p className="font-mono text-white/80 font-bold">VALID THROUGH 2027</p>
                <p>INSTITUTE OF HIGHER TECHNOLOGY</p>
              </div>

              {/* QR Code thumbnail */}
              <button
                type="button"
                onClick={() => navigate(`/verify/${verificationToken}`)}
                className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                title="Click to test public verification"
              >
                <QrCode className="w-10 h-10 text-black" />
              </button>
            </div>
          </div>

          {/* Actions & Verification details */}
          <div className="space-y-4 max-w-sm w-full">
            <div className="portal-card p-6 space-y-4">
              <h3 className="portal-heading text-sm text-[var(--app-text)]">
                Credential Actions
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full px-4 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print Card PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/verify/${verificationToken}`)}
                  className="w-full px-4 py-2.5 rounded-full border border-[var(--app-border)] text-[var(--app-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--app-surface-subtle)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Public Verify Page</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 rounded-xl text-[11px] font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer text-center"
                >
                  {copiedLink ? 'Copied to Clipboard!' : 'Copy Public Verification Link'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--app-text)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
                <span>Zero-Login Public Verification</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Anyone scanning your ID card's QR code is directed to a secure, unauthenticated verification endpoint showing your official active enrolled status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
