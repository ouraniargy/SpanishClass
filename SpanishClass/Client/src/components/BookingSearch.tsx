type Props = {
  searchEmail: string;
  setSearchEmail: (v: string) => void;
  searchMobilePhone: string;
  setSearchMobilePhone: (v: string) => void;
  searchId: string;
  setSearchId: (v: string) => void;
  searchLessonName: string;
  setSearchLessonName: (v: string) => void;
  handleSearch: () => void;
  userRole: string;
  showSearchResults: boolean;
  setShowSearchResults: (v: boolean) => void;
  searchResult: any[];
  currentIndex: number;
  setCurrentIndex: (v: number) => void;
  cardsPerView: number;
  isMobile: boolean;
  qrCodes: Record<string, string>;
  handleDownloadQr: (bookingCode: string) => void;
  lessonImage?: string;
};

const inputStyle = {
  padding: "12px",
  width: "100%",
  borderRadius: "6px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
  marginBottom: "10px",
};

const searchBtnStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "white",
  fontWeight: "500",
  cursor: "pointer",
  fontSize: "14px",
};

const closeBtnStyle = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};

const navWrapper = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const navBtn = {
  padding: "10px",
  fontSize: "18px",
  cursor: "pointer",
};

const downloadBtn = {
  marginTop: 10,
  padding: "10px",
  width: "100%",
  borderRadius: "6px",
  border: "none",
  background: "#10b981",
  color: "white",
  cursor: "pointer",
};

export default function BookingSearch({
  searchEmail,
  setSearchEmail,
  searchMobilePhone,
  setSearchMobilePhone,
  searchId,
  setSearchId,
  searchLessonName,
  setSearchLessonName,
  handleSearch,
  userRole,
  showSearchResults,
  setShowSearchResults,
  searchResult,
  currentIndex,
  setCurrentIndex,
  cardsPerView,
  isMobile,
  qrCodes,
  handleDownloadQr,
}: Props) {
  const cardStyle = (isMobile: boolean): React.CSSProperties => ({
    flex: isMobile ? "0 0 100%" : "0 0 50%",
    background: "#f5f5f5",
    padding: isMobile ? 15 : 20,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  return (
    <>
      {/* SEARCH INPUTS */}
      <div style={{ marginBottom: 12, width: "100%", maxWidth: "500px" }}>
        <div style={{ marginBottom: "10px" }}>
          {userRole === "Professor" && (
            <>
              <input
                type="email"
                placeholder="Enter email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Enter mobile phone"
                value={searchMobilePhone}
                onChange={(e) => setSearchMobilePhone(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Enter id of booking"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Enter lesson name"
                value={searchLessonName}
                onChange={(e) => setSearchLessonName(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          {userRole === "Student" && (
            <>
              <input
                placeholder="Enter id of booking"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Enter lesson name"
                value={searchLessonName}
                onChange={(e) => setSearchLessonName(e.target.value)}
                style={inputStyle}
              />
            </>
          )}
          <></>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSearch} style={searchBtnStyle}>
            Search Booking
          </button>

          {showSearchResults && (
            <button
              onClick={() => setShowSearchResults(false)}
              style={closeBtnStyle}
            >
              X
            </button>
          )}
        </div>
      </div>

      {/* RESULTS */}
      {showSearchResults && (
        <>
          <div style={navWrapper}>
            <button
              onClick={() =>
                setCurrentIndex(Math.max(currentIndex - cardsPerView, 0))
              }
              disabled={currentIndex === 0}
              style={navBtn}
            >
              ◀
            </button>

            <button
              onClick={() =>
                setCurrentIndex(
                  Math.min(
                    currentIndex + cardsPerView,
                    searchResult.length - cardsPerView,
                  ),
                )
              }
              disabled={currentIndex >= searchResult.length - cardsPerView}
              style={navBtn}
            >
              ▶
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
            {searchResult
              .slice(currentIndex, currentIndex + cardsPerView)
              .map((b: any) => (
                <div key={b.bookingCode} style={cardStyle(isMobile)}>
                  <h3 style={{ fontSize: isMobile ? "16px" : "18px" }}>
                    Welcome {b.studentName}
                  </h3>

                  <p>
                    <b>Lesson:</b> {b.lesson}
                  </p>
                  <p>
                    <b>Description:</b> {b.description}
                  </p>
                  <p>
                    <b>Date:</b> {new Date(b.date).toLocaleString()}
                  </p>
                  <p>
                    <b>Unique number of reservation:</b> {b.bookingCode}
                  </p>
                  {b.lessonPhoto && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <img
                        src={`https://localhost:7185${b.lessonPhoto}`}
                        alt={b.lesson}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  )}

                  {qrCodes[b.bookingCode] && (
                    <>
                      <img
                        src={`data:image/png;base64,${qrCodes[b.bookingCode]}`}
                        alt="Booking QR"
                        style={{
                          marginTop: 15,
                          width: isMobile ? 120 : 140,
                          height: isMobile ? 120 : 140,
                        }}
                      />

                      <button
                        onClick={() => handleDownloadQr(b.bookingCode)}
                        style={downloadBtn}
                      >
                        Download QR
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
}
